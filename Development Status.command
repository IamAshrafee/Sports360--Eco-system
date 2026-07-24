#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"${project_root}/scripts/dev-environment.sh" status

if [[ -t 0 ]]; then
  printf '\nPress Return to close this window...'
  read -r
fi
