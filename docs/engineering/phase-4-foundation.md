# Phase 4 Engineering Foundation

Status: Complete

Date: 2026-07-24

## Outcome

Phase 4 converts the approved product and architecture into a reproducible,
executable, security-tested foundation. No booking feature has been pulled
forward: this phase establishes the boundaries that Phase 5 booking work must
use.

## Repository and process boundaries

| Workspace | Responsibility |
|---|---|
| `apps/web` | Responsive Next.js first-party web client |
| `apps/api` | Versioned Fastify API and Better Auth HTTP boundary |
| `apps/worker` | PostgreSQL outbox dispatcher and BullMQ worker process |
| `packages/api-client` | OpenAPI-generated, independently compiled TypeScript SDK |
| `packages/auth` | Better Auth configuration, phone OTP port, and identity mapping |
| `packages/authorization` | Application permission and venue-scope checks |
| `packages/contracts` | Runtime-validated cross-boundary types and permission codes |
| `packages/domain` | Opaque domain identifiers |
| `packages/jobs` | Durable outbox and BullMQ publication boundary |
| `packages/observability` | Structured logging, redaction, and OTLP lifecycle |
| `packages/persistence` | Kysely/pg access, migrations, tenant context, and seeds |
| `packages/ui` | Shared shadcn/ui primitives and semantic design tokens |

The API, web client, and worker remain separately deployable processes in one
modular-monolith repository. Future mobile and partner clients use the same
versioned API rather than importing server internals.

## Reproducible toolchain

- Node.js `24.18.0` and pnpm `11.17.0` are exact and enforced.
- Dependency versions and the pnpm lockfile are exact.
- Releases younger than 24 hours fail installation by policy.
- Dependency lifecycle scripts are denied unless explicitly reviewed.
- `msgpackr-extract` and `protobufjs` optional scripts are explicitly denied;
  the reviewed required scripts remain allowlisted.
- CI installs from the frozen lockfile and runs code generation, quality,
  integration, and production-build gates.
- The version and security review is recorded in
  [toolchain-version-audit.md](toolchain-version-audit.md).

## PostgreSQL and tenancy

Local infrastructure uses PostgreSQL `18.4` and Valkey `9.1.0`. Ordered,
checksum-protected SQL migrations run under an advisory lock and refuse an
edited migration that has already been applied.

The schema establishes:

- Better Auth user, session, account, and verification storage in `auth`;
- application users mapped to auth subjects without making auth records the
  business domain model;
- businesses, memberships, fixed access profiles, permissions, venues, and
  selected-venue scopes;
- subscription entitlements and separate platform administrators;
- append-only audit entries;
- transactional outbox and idempotency records;
- resources, allocatable resource units, and half-open capacity claims.

Tenant tables carry `business_id`, tenant relationships use composite foreign
keys, and row-level security is enabled (and forced where no controlled
owner-wide function is required). The runtime role owns no application tables
and is explicitly `NOSUPERUSER`, `NOCREATEROLE`, and `NOBYPASSRLS`. A
transaction-local context is established only after validating auth subject,
session version, active membership, profile, permissions, and venue scope.

PostgreSQL exclusion constraints prevent overlapping active claims for the
same allocatable unit. Adjacent `[start, end)` ranges remain valid.

## Identity and authorization

Better Auth `1.6.23` is self-hosted over PostgreSQL and mounted under
`/v1/auth`. Phone verification accepts normalized Bangladesh numbers and uses
an `OtpPort`; no SMS vendor type enters domain or API contracts. The real local
integration test sends and verifies an OTP through a capturing provider,
persists a session, and maps the auth subject into `app.users`.

Production and normal local startup fail closed with a disabled OTP provider
until a real provider adapter and credentials are configured. OTP values,
phone numbers, session tokens, authorization headers, cookies, and passwords
are redacted from structured logs.

Authorization is deny-by-default at two layers:

1. application permission and venue-scope checks;
2. PostgreSQL tenant and venue-scope policies.

Session and membership access versions provide immediate application-level
revocation boundaries. Tenant ownership does not grant platform
administration; platform functions revalidate an explicit platform permission.

## Audit and asynchronous work

Audit entries capture business, actor, membership, correlation, before/after
data, metadata, and occurrence time. A trigger rejects updates and deletes.

PostgreSQL is the durable source for outbound work. The dispatcher:

- claims due outbox rows with `FOR UPDATE SKIP LOCKED`;
- records worker ownership and attempts;
- publishes with the outbox UUID as the BullMQ job ID;
- marks completion only after queue acceptance;
- releases failures with bounded exponential delay;
- reclaims abandoned locks after a worker crash.

The integration suite proves duplicate queue publication is deduplicated,
abandoned work is reclaimed by a replacement worker, and completion is
idempotent. Valkey is therefore acceleration/delivery infrastructure, not the
only record of required work.

## API-first contract

Fastify generates OpenAPI `3.1` from runtime route schemas. Interactive
documentation is served under `/v1/docs`. `corepack pnpm api:generate` writes
the committed OpenAPI document and regenerates the standalone TypeScript SDK.
CI regenerates both and fails on an uncommitted difference.

The current API includes:

- `/v1/auth/*` for Better Auth;
- `/v1/me` for the mapped application identity;
- `/v1/health/live` for process liveness;
- `/v1/health/ready` for PostgreSQL readiness.

This is the first executable proof that a web, mobile, or integration client
can compile against the API without importing the API application.

## Observability and recovery

API and worker logs are structured and share an automated sensitive-value
redaction policy. OpenTelemetry trace and metric exporters are enabled when an
OTLP endpoint is supplied and remain a no-op locally when it is absent.

The [backup and restore runbook](backup-restore-runbook.md) provides scoped
local commands and the production adaptation checklist. On 2026-07-24 a
custom-format backup was restored into the isolated
`sports_restore_drill` database and verified with:

```text
migrations=4,businesses=2,users=2,venues=2
```

The drill database was removed by the script; the source database was never
overwritten.

## Executable verification

The complete gate is:

```sh
corepack pnpm infra:up
corepack pnpm api:generate
corepack pnpm check
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm test:integration
corepack pnpm build
corepack pnpm backup:local
corepack pnpm restore:drill
```

The integration suite proves:

- runtime role attributes and deny-before-context behavior;
- authorized tenant visibility and cross-tenant denial;
- invalid membership and revoked-session denial;
- platform/tenant administration separation;
- capacity conflict rejection and adjacent-range acceptance;
- append-only audit behavior;
- outbox crash recovery and idempotent completion;
- migration idempotence;
- Better Auth phone OTP/session/application mapping;
- BullMQ duplicate-publication protection.

## Explicitly deferred

Phase 4 does not claim the following:

- booking, customer, payment, schedule, or reporting product features;
- a production SMS contract or credentials;
- a production OTLP/error-reporting vendor account;
- cloud deployment, measured Dhaka latency, or provider recovery values;
- native mobile or partner API authentication.

Those items remain in their scheduled phases or deployment gates. Phase 5 may
now implement the staff-side booking core on this foundation.
