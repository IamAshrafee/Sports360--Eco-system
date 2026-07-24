# Architecture Decision Records

Status: Active

Architecture Decision Records are immutable decision history. A later change
adds a superseding ADR rather than rewriting the reason an earlier decision was
made.

| ADR | Status | Decision |
|---|---|---|
| [ADR-001](ADR-001-modular-monolith.md) | Accepted | Modular monolith with separate web, API, and worker processes |
| [ADR-002](ADR-002-api-first-contracts.md) | Accepted | API-first contracts for web, future mobile, and integrations |
| [ADR-003](ADR-003-typescript-runtime-and-frameworks.md) | Accepted | TypeScript, Node.js LTS, Next.js, and Fastify |
| [ADR-004](ADR-004-postgresql-and-tenancy.md) | Accepted | PostgreSQL-specific transactional core and shared-schema tenancy |
| [ADR-005](ADR-005-capacity-concurrency.md) | Accepted | Database-enforced resource capacity and serialized resource mutations |
| [ADR-006](ADR-006-lean-managed-infrastructure.md) | Accepted | Lean managed, portable infrastructure before provider lock-in |
| [ADR-007](ADR-007-sql-access-and-migrations.md) | Accepted | Kysely, node-postgres, and SQL-first migrations |
| [ADR-008](ADR-008-authentication-and-otp.md) | Accepted | Better Auth with application-owned authorization and pluggable OTP |
| [ADR-009](ADR-009-initial-cloud-and-region.md) | Accepted with gates | DigitalOcean Bangalore as provisional production platform |
| [ADR-010](ADR-010-jobs-and-outbound-providers.md) | Accepted | BullMQ, managed Valkey, and replaceable outbound providers |
| [ADR-011](ADR-011-observability.md) | Accepted | OpenTelemetry with Better Stack as initial backend |
| [ADR-012](ADR-012-repository-and-package-management.md) | Accepted | pnpm workspace without an initial build orchestrator |
| [ADR-013](ADR-013-shadcn-ui-design-system.md) | Accepted | shadcn/ui as the frontend design-system foundation |

## ADR format

```text
Title
Status and date
Context
Decision
Alternatives
Consequences
Migration/reversal path
Traceability
```
