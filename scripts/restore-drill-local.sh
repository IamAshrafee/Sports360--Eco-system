#!/bin/sh

set -eu

backup_path=".artifacts/backups/local-latest.dump"
drill_database="sports_restore_drill"

if [ ! -s "${backup_path}" ]; then
  echo "Backup not found. Run the local backup command first." >&2
  exit 1
fi

cleanup() {
  docker compose exec -T postgres \
    dropdb \
    --username=sports_migrator \
    --if-exists \
    "${drill_database}" >/dev/null
}

trap cleanup EXIT
cleanup

docker compose exec -T postgres \
  createdb \
  --username=sports_migrator \
  "${drill_database}"

docker compose exec -T postgres \
  pg_restore \
  --username=sports_migrator \
  --dbname="${drill_database}" \
  --no-owner \
  --no-privileges \
  < "${backup_path}"

verification_result="$(
  docker compose exec -T postgres \
    psql \
    --username=sports_migrator \
    --dbname="${drill_database}" \
    --tuples-only \
    --no-align \
    --command="
      SELECT concat_ws(
        ',',
        'migrations=' || (SELECT count(*) FROM app.schema_migrations),
        'businesses=' || (SELECT count(*) FROM app.businesses),
        'users=' || (SELECT count(*) FROM app.users),
        'venues=' || (SELECT count(*) FROM app.venues)
      );
    "
)"

case "${verification_result}" in
  migrations=4,businesses=2,users=2,venues=2)
    echo "Restore drill verified: ${verification_result}"
    ;;
  *)
    echo "Restore verification failed: ${verification_result}" >&2
    exit 1
    ;;
esac
