#!/bin/sh

set -eu

artifact_directory=".artifacts/backups"
backup_path="${artifact_directory}/local-latest.dump"

mkdir -p "${artifact_directory}"

docker compose exec -T postgres \
  pg_dump \
  --username=sports_migrator \
  --dbname=sports_management \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  > "${backup_path}"

test -s "${backup_path}"

echo "Backup created at ${backup_path}"
