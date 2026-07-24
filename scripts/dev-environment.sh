#!/usr/bin/env bash

set -euo pipefail

dev_script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dev_repository_root="$(cd "${dev_script_directory}/.." && pwd)"
dev_script_path="${dev_script_directory}/dev-environment.sh"
dev_wrapper="${dev_script_directory}/pnpmw"
dev_runtime_directory="${dev_repository_root}/.artifacts/dev"
dev_supervisor_pid_file="${dev_runtime_directory}/supervisor.pid"
dev_web_log="${dev_runtime_directory}/web.log"
dev_api_log="${dev_runtime_directory}/api.log"
dev_worker_log="${dev_runtime_directory}/worker.log"
dev_child_pids=()
dev_tail_pid=""
dev_cleanup_started="false"

dev_print_usage() {
  printf '%s\n' \
    "Usage: scripts/dev-environment.sh <start|restart|stop|status>" \
    "" \
    "  start    Start infrastructure, verify it, and supervise all app services." \
    "  restart  Stop a running environment, then start it again." \
    "  stop     Stop web, API, and worker processes. Infrastructure stays running." \
    "  status   Show supervisor and service readiness."
}

dev_read_supervisor_pid() {
  if [[ ! -f "${dev_supervisor_pid_file}" ]]; then
    return 1
  fi

  local pid
  pid="$(tr -d '[:space:]' <"${dev_supervisor_pid_file}")"
  if [[ ! "${pid}" =~ ^[0-9]+$ ]]; then
    return 1
  fi

  printf '%s\n' "${pid}"
}

dev_process_is_running() {
  local pid="$1"
  kill -0 "${pid}" 2>/dev/null
}

dev_process_is_supervisor() {
  local pid="$1"
  local command_line
  local lsof_command=""
  local process_directory=""

  command_line="$(ps -p "${pid}" -o command= 2>/dev/null || true)"

  if [[ -e "/proc/${pid}/cwd" ]]; then
    process_directory="$(cd "/proc/${pid}/cwd" 2>/dev/null && pwd -P || true)"
  elif command -v lsof >/dev/null 2>&1; then
    lsof_command="$(command -v lsof)"
  elif [[ -x "/usr/sbin/lsof" ]]; then
    lsof_command="/usr/sbin/lsof"
  fi

  if [[ -n "${lsof_command}" ]]; then
    process_directory="$(
      "${lsof_command}" -a -p "${pid}" -d cwd -Fn 2>/dev/null |
        sed -n 's/^n//p'
    )"
  fi

  [[ "${process_directory}" == "${dev_repository_root}" ]] &&
    {
      [[ "${command_line}" == *"${dev_script_path}"* ]] ||
        [[ "${command_line}" == *"scripts/dev-environment.sh start"* ]] ||
        [[ "${command_line}" == *"scripts/dev-environment.sh restart"* ]]
    }
}

dev_remove_stale_pid_file() {
  local pid
  pid="$(dev_read_supervisor_pid 2>/dev/null || true)"

  if [[ -z "${pid}" ]] || ! dev_process_is_running "${pid}"; then
    rm -f "${dev_supervisor_pid_file}"
  fi
}

dev_terminate_process_tree() {
  local pid="$1"
  local child_pid

  if ! dev_process_is_running "${pid}"; then
    return
  fi

  while IFS= read -r child_pid; do
    if [[ "${child_pid}" =~ ^[0-9]+$ ]]; then
      dev_terminate_process_tree "${child_pid}"
    fi
  done < <(pgrep -P "${pid}" 2>/dev/null || true)

  kill -TERM "${pid}" 2>/dev/null || true
}

dev_cleanup() {
  local child_pid

  if [[ "${dev_cleanup_started}" == "true" ]]; then
    return
  fi
  dev_cleanup_started="true"
  trap - EXIT INT TERM

  if [[ -n "${dev_tail_pid}" ]]; then
    dev_terminate_process_tree "${dev_tail_pid}"
    wait "${dev_tail_pid}" 2>/dev/null || true
  fi

  for child_pid in "${dev_child_pids[@]}"; do
    dev_terminate_process_tree "${child_pid}"
  done

  for child_pid in "${dev_child_pids[@]}"; do
    wait "${child_pid}" 2>/dev/null || true
  done

  if [[ -f "${dev_supervisor_pid_file}" ]] &&
    [[ "$(tr -d '[:space:]' <"${dev_supervisor_pid_file}")" == "$$" ]]; then
    rm -f "${dev_supervisor_pid_file}"
  fi

  printf '\nDevelopment services stopped. PostgreSQL and Valkey remain running.\n'
}

dev_handle_signal() {
  exit 130
}

dev_wait_for_url() {
  local label="$1"
  local url="$2"
  local process_pid="$3"
  local log_file="$4"
  local attempt

  for attempt in $(seq 1 45); do
    if curl --fail --silent --show-error --max-time 2 "${url}" >/dev/null 2>&1; then
      printf '  %-8s ready: %s\n' "${label}" "${url}"
      return
    fi

    if ! dev_process_is_running "${process_pid}"; then
      printf '%s stopped before becoming ready. Last log lines:\n' "${label}" >&2
      tail -n 30 "${log_file}" >&2 || true
      return 1
    fi

    sleep 1
  done

  printf '%s did not become ready within 45 seconds. Last log lines:\n' "${label}" >&2
  tail -n 30 "${log_file}" >&2 || true
  return 1
}

dev_wait_for_worker() {
  local process_pid="$1"
  local attempt

  for attempt in $(seq 1 45); do
    if grep -q "worker started" "${dev_worker_log}" 2>/dev/null; then
      printf '  %-8s ready: outbound job processor\n' "Worker"
      return
    fi

    if ! dev_process_is_running "${process_pid}"; then
      printf 'Worker stopped before becoming ready. Last log lines:\n' >&2
      tail -n 30 "${dev_worker_log}" >&2 || true
      return 1
    fi

    sleep 1
  done

  printf 'Worker did not become ready within 45 seconds. Last log lines:\n' >&2
  tail -n 30 "${dev_worker_log}" >&2 || true
  return 1
}

dev_start() {
  local existing_pid
  local web_pid
  local api_pid
  local worker_pid
  local child_pid

  mkdir -p "${dev_runtime_directory}"
  dev_remove_stale_pid_file
  existing_pid="$(dev_read_supervisor_pid 2>/dev/null || true)"

  if [[ -n "${existing_pid}" ]] && dev_process_is_running "${existing_pid}"; then
    if dev_process_is_supervisor "${existing_pid}"; then
      printf 'The development environment is already running (PID %s).\n' "${existing_pid}"
      dev_status
      return
    fi

    printf '%s\n' \
      "Refusing to replace ${dev_supervisor_pid_file}." \
      "It points to running PID ${existing_pid}, but that process is not this project's supervisor." >&2
    return 1
  fi

  printf '%s\n' "$$" >"${dev_supervisor_pid_file}"
  : >"${dev_web_log}"
  : >"${dev_api_log}"
  : >"${dev_worker_log}"

  trap dev_cleanup EXIT
  trap dev_handle_signal INT TERM

  printf 'Starting local PostgreSQL and Valkey...\n'
  "${dev_wrapper}" infra:up

  printf '\nChecking the complete development environment...\n'
  "${dev_wrapper}" project:doctor:full

  printf '\nStarting application services...\n'
  "${dev_wrapper}" dev:web >"${dev_web_log}" 2>&1 &
  web_pid=$!
  dev_child_pids+=("${web_pid}")

  "${dev_wrapper}" dev:api >"${dev_api_log}" 2>&1 &
  api_pid=$!
  dev_child_pids+=("${api_pid}")

  "${dev_wrapper}" dev:worker >"${dev_worker_log}" 2>&1 &
  worker_pid=$!
  dev_child_pids+=("${worker_pid}")

  dev_wait_for_url "Web" "http://localhost:3000" "${web_pid}" "${dev_web_log}"
  dev_wait_for_url "API" "http://localhost:4000/v1/health/ready" "${api_pid}" "${dev_api_log}"
  dev_wait_for_worker "${worker_pid}"

  printf '%s\n' \
    "" \
    "Development environment is ready." \
    "  Web:      http://localhost:3000" \
    "  API:      http://localhost:4000" \
    "  API docs: http://localhost:4000/docs" \
    "  Logs:     ${dev_runtime_directory}" \
    "" \
    "Keep this Terminal window open. Press Control-C to stop app services." \
    "PostgreSQL and Valkey stay running for faster restarts."

  tail -n +1 -F "${dev_web_log}" "${dev_api_log}" "${dev_worker_log}" &
  dev_tail_pid=$!

  while true; do
    for child_pid in "${dev_child_pids[@]}"; do
      if ! dev_process_is_running "${child_pid}"; then
        printf '\nA development service stopped unexpectedly. Check logs in %s.\n' \
          "${dev_runtime_directory}" >&2
        return 1
      fi
    done
    sleep 2
  done
}

dev_stop() {
  local supervisor_pid
  local attempt

  mkdir -p "${dev_runtime_directory}"
  supervisor_pid="$(dev_read_supervisor_pid 2>/dev/null || true)"

  if [[ -z "${supervisor_pid}" ]]; then
    rm -f "${dev_supervisor_pid_file}"
    printf 'Development services are not running.\n'
    return
  fi

  if ! dev_process_is_running "${supervisor_pid}"; then
    rm -f "${dev_supervisor_pid_file}"
    printf 'Removed a stale development supervisor PID file.\n'
    return
  fi

  if ! dev_process_is_supervisor "${supervisor_pid}"; then
    printf '%s\n' \
      "Refusing to stop PID ${supervisor_pid}." \
      "The PID file exists, but the running process is not this project's supervisor." >&2
    return 1
  fi

  printf 'Stopping development services (supervisor PID %s)...\n' "${supervisor_pid}"
  kill -TERM "${supervisor_pid}"

  for attempt in $(seq 1 50); do
    if ! dev_process_is_running "${supervisor_pid}"; then
      rm -f "${dev_supervisor_pid_file}"
      printf 'Development services stopped. PostgreSQL and Valkey remain running.\n'
      return
    fi
    sleep 0.1
  done

  if dev_process_is_supervisor "${supervisor_pid}"; then
    printf 'The supervisor did not stop cleanly; forcing only validated PID %s to exit.\n' \
      "${supervisor_pid}" >&2
    kill -KILL "${supervisor_pid}" 2>/dev/null || true
  fi
  rm -f "${dev_supervisor_pid_file}"
}

dev_probe_url() {
  local label="$1"
  local url="$2"

  if curl --fail --silent --max-time 2 "${url}" >/dev/null 2>&1; then
    printf '  %-8s ready  %s\n' "${label}" "${url}"
  else
    printf '  %-8s down   %s\n' "${label}" "${url}"
  fi
}

dev_status() {
  local supervisor_pid
  supervisor_pid="$(dev_read_supervisor_pid 2>/dev/null || true)"

  if [[ -n "${supervisor_pid}" ]] &&
    dev_process_is_running "${supervisor_pid}" &&
    dev_process_is_supervisor "${supervisor_pid}"; then
    printf 'Development supervisor: running (PID %s)\n' "${supervisor_pid}"
  else
    printf 'Development supervisor: stopped\n'
    dev_remove_stale_pid_file
  fi

  dev_probe_url "Web" "http://localhost:3000"
  dev_probe_url "API" "http://localhost:4000/v1/health/ready"
  printf '  %-8s %s\n' "Logs" "${dev_runtime_directory}"
}

dev_action="${1:-start}"

case "${dev_action}" in
  start)
    dev_start
    ;;
  restart)
    dev_stop
    dev_start
    ;;
  stop)
    dev_stop
    ;;
  status)
    dev_status
    ;;
  help | --help | -h)
    dev_print_usage
    ;;
  *)
    dev_print_usage >&2
    exit 2
    ;;
esac
