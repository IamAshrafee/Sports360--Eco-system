# PostgreSQL Backup and Restore Runbook

Status: Implemented and locally rehearsed

Date: 2026-07-24

## Recovery objective

PostgreSQL is the system of record. Valkey and BullMQ can be reconstructed from
the PostgreSQL outbox, so the database backup is the critical recovery
artifact. The initial operational target is:

- daily managed PostgreSQL backups in production;
- point-in-time recovery when the chosen provider supports it;
- encrypted retention in a different failure domain;
- a quarterly restore rehearsal;
- an evidence record containing backup time, restore time, schema migration
  count, verification results, and any corrective action.

Provider retention and recovery-time values are deployment decisions and must
not be claimed until the production provider is configured.

## Local backup

With the local infrastructure healthy, run:

```sh
corepack pnpm backup:local
```

This writes a PostgreSQL custom-format archive to
`.artifacts/backups/local-latest.dump`. The artifact directory is ignored by
Git. The command excludes ownership and grants so a restore does not silently
copy environment-specific role assignments.

## Restore rehearsal

Run:

```sh
corepack pnpm restore:drill
```

The drill:

1. uses the explicit temporary database `sports_restore_drill`;
2. restores the custom-format archive;
3. verifies migration, business, user, and venue counts;
4. drops only the drill database through an exit trap.

The source `sports_management` database is never dropped or modified by the
restore script.

## Production adaptation

Production automation must use the managed provider's backup and
point-in-time-recovery facilities. Before launch, record:

- responsible account and least-privileged restore role;
- backup schedule, retention, encryption, and region;
- expected recovery point objective and recovery time objective;
- exact provider restore procedure;
- post-restore checks for schema migrations, tenant counts, recent audit
  entries, and outbox backlog;
- application cutover and rollback steps.

Never test a restore by overwriting the production database. Restore into an
isolated database or environment, validate it, and make cutover a separate,
explicitly approved operation.
