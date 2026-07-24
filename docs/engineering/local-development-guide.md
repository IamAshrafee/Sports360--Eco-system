# Local Development Guide

Status: Active

Updated: 2026-07-24

This guide provides one consistent way to start, restart, inspect, and stop the
complete local application on macOS. Every route uses the repository runtime
wrapper, so Node.js and pnpm cannot silently drift from the pinned project
versions.

## Recommended macOS workflow

Open the repository folder in Finder and double-click:

- `Start Development.command` to start PostgreSQL, Valkey, web, API, and worker;
- `Restart Development.command` after changing configuration or when a clean
  application restart is needed;
- `Development Status.command` to inspect the supervisor and HTTP readiness;
- `Stop Development.command` to stop web, API, and worker.

macOS opens the launcher in Terminal. Keep the Start or Restart Terminal window
open while developing. Press Control-C in that window to stop the application
services cleanly.

The first time a downloaded or copied `.command` file is opened, macOS may ask
for confirmation. These repository files are plain Bash scripts and can be
reviewed before opening.

## What start does

The launcher performs these steps in order:

1. activates the exact Node.js version declared by the repository;
2. starts and waits for local PostgreSQL and Valkey;
3. provisions the local database roles when needed;
4. runs the full project doctor;
5. starts web, API, and worker processes;
6. waits for web, API, and worker readiness;
7. streams all three service logs in one Terminal window.

Start fails with a specific diagnostic if dependencies, Docker, a port, or a
service is unhealthy. It does not install or upgrade Node.js automatically.

## Local addresses

- Web application: <http://localhost:3000>
- API: <http://localhost:4000>
- API readiness: <http://localhost:4000/v1/health/ready>
- Interactive API documentation: <http://localhost:4000/docs>

Service logs and the supervisor PID are stored under `.artifacts/dev/`, which
is excluded from Git:

- `.artifacts/dev/web.log`
- `.artifacts/dev/api.log`
- `.artifacts/dev/worker.log`

## Terminal commands

Finder launchers and terminal commands call the same supervisor:

```bash
./scripts/dev-environment.sh start
./scripts/dev-environment.sh restart
./scripts/dev-environment.sh status
./scripts/dev-environment.sh stop
```

The equivalent project commands are:

```bash
./scripts/pnpmw dev:environment
./scripts/pnpmw dev:environment:restart
./scripts/pnpmw dev:environment:status
./scripts/pnpmw dev:environment:stop
```

Do not run Start twice. A second start detects the existing validated
supervisor and reports its status instead of creating duplicate processes.

## Stop behavior

Stop and Control-C terminate web, API, and worker, but deliberately leave
PostgreSQL and Valkey running. This makes the next start or restart faster and
preserves the local database.

To stop the Docker infrastructure too:

```bash
./scripts/pnpmw infra:down
```

`infra:down` stops and removes the local containers but does not delete their
named data volumes. Do not add Docker's volume-removal option unless local data
deletion is intentional.

## Manual fallback

If the supervisor itself needs diagnosis, use separate Terminal tabs:

```bash
./scripts/pnpmw infra:up
./scripts/pnpmw project:doctor:full
./scripts/pnpmw dev:web
./scripts/pnpmw dev:api
./scripts/pnpmw dev:worker
```

Run the last three commands in separate tabs. Stop each with Control-C.

If a launcher reports that its PID file points to an unrelated running
process, do not delete or kill that process blindly. Inspect
`.artifacts/dev/supervisor.pid` and the reported PID before taking action.
