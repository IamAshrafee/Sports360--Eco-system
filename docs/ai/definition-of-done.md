# Definition of Done

Status: Active

A task is done only when its requested outcome is implemented, the relevant
source of truth is consistent, and fresh evidence supports the completion
claim.

## Baseline for code changes

- Scope traces to an approved requirement or explicitly approved correction.
- Type, lint, unit-test, and formatting checks pass with
  `corepack pnpm ai:verify`.
- New behavior has tests at the cheapest reliable layer.
- Error paths, permissions, tenant scope, and accessibility were considered.
- No unrelated user changes were overwritten or staged.
- Handoff and material implementation documents are current.

## Additional evidence by change

| Change | Required evidence |
|---|---|
| PostgreSQL schema, RLS, migration, constraint | Real PostgreSQL migration and integration tests; deny-path and cross-tenant proof |
| Booking capacity or time interval | Concurrent conflict, adjacency, timezone, and operational-date cases |
| Money or payment | Exact minor-unit calculations, transaction history, reversal/refund bounds, reconciliation |
| API contract | Runtime schema/OpenAPI agreement, regenerated client, compile/contract tests |
| Background work | Outbox durability, retry/idempotency, crash/reclaim, sensitive-data checks |
| Shared UI or core workflow | Interaction, keyboard/focus, error/disabled/loading states, responsive behavior |
| Authentication/authorization | Allowed and denied paths, revocation/version behavior, redaction |
| Recovery/operations | Isolated rehearsal with counts/integrity evidence and no source overwrite |

## Full repository gate

With local PostgreSQL and Valkey available:

```sh
corepack pnpm ai:verify:full
```

This must cover generation, static/unit checks, migrations, seeds, integration
tests, and production builds. Backup/restore drills are additionally required
when recovery, schema, or release-readiness claims depend on them.

## Honest exceptions

An unavailable external provider, environment, or manual device check may
remain unverified only when:

1. the requested local implementation is otherwise complete;
2. the missing evidence is stated precisely;
3. no passing claim is made for it;
4. the exact follow-up verification is recorded.

Deferred, mocked, designed, implemented, and verified are different states.
