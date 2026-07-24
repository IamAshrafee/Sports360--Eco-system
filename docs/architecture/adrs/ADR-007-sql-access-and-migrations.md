# ADR-007: Kysely, node-postgres, and SQL-First Migrations

Status: Accepted
Date: 2026-07-24

## Context

The transactional core depends deliberately on PostgreSQL ranges, GiST
exclusion constraints, partial indexes, composite tenant-safe references, RLS,
transaction-local context, and database functions/triggers where they provide
the strongest invariant. A high-level ORM must not hide or weaken those
features.

The application still needs compile-time help for ordinary queries and a small,
understandable data-access surface for one developer.

## Decision

- Use Kysely as the typed SQL query builder.
- Use `pg` (`node-postgres`) as the PostgreSQL driver and connection-pool
  boundary.
- Keep migrations as reviewed, ordered SQL files executed by a small
  migration command with a database migration ledger and advisory lock.
- Allow Kysely's raw `sql` escape hatch for application queries that need
  PostgreSQL-specific expressions.
- Generate or maintain database row types from the migrated schema; generated
  types are build artifacts, not the schema authority.
- Keep repositories/query services inside their owning module. No global
  generic repository abstraction is introduced.
- Pin exact versions in Phase 4 after a compatibility spike.

The schema and migration SQL—not TypeScript model declarations—are the final
authority for database structure and invariants.

## Alternatives

### Drizzle ORM

Drizzle supports PostgreSQL, transactions, indexes, constraints, and RLS.
However, its current documentation is transitioning to a version 1 release
candidate. Selecting that release candidate for the first transactional
foundation adds avoidable upgrade risk, while the specialized constraints
would still require reviewed SQL.

Drizzle can be reconsidered later if its stable release materially reduces
maintenance without obscuring the schema.

### Prisma ORM

Prisma provides productive CRUD and migration tooling, but this system's
PostgreSQL-specific ranges, exclusion constraints, RLS context, and
constraint-heavy transaction paths would create frequent raw-SQL and migration
escape hatches. That is the wrong abstraction balance for the core.

### Untyped SQL only

Maximum SQL visibility, but more manual result typing and refactor risk for
ordinary application queries.

## Consequences

- Developers must understand and review PostgreSQL SQL.
- Migration tests run against real PostgreSQL, never only an in-memory
  substitute.
- Database-generated constraints and RLS policies are inspected in CI after
  migration.
- Kysely is replaceable at repository boundaries; migration SQL and database
  invariants survive that replacement.
- There is no promise of database-vendor portability.

## Migration and reversal path

Because ordered SQL owns the schema, replacing Kysely affects application query
code rather than rewriting migration history. Repositories can be converted
module by module behind existing application interfaces.

## References

- [Kysely documentation](https://www.kysely.dev/)
- [Kysely repository and releases](https://github.com/kysely-org/kysely)
- [node-postgres documentation](https://node-postgres.com/)
- [Drizzle RLS documentation](https://orm.drizzle.team/docs/rls)

## Traceability

ADR-004; ADR-005; NFR-SEC-001–008; NFR-FIN-001–006; NFR-MNT-001–006.
