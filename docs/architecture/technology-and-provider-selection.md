# Technology and Provider Selection

Status: Phase 3 selection complete; conditional providers require Phase 4 gates

## Selection rule

The architecture chooses stable interfaces first and providers second:

```text
domain/application contract
→ infrastructure port
→ selected adapter
→ measured activation gate
→ documented fallback
```

A provider can be selected without being trusted blindly. Authentication,
delivery, recovery, latency, and managed-service compatibility become active
only after the stated tests pass.

## Final selection matrix

| Concern | Selection | Status | Why | Fallback/reversal |
|---|---|---|---|---|
| Runtime | TypeScript + Node.js production LTS | Accepted | Founder fit, supported ecosystem, web/API/worker reuse | Test later runtime changes behind contracts |
| Web | Next.js App Router + React | Accepted | Staff web, public rendering, mobile web, SSR/SEO | Web can change without changing API/domain |
| UI system | shadcn/ui + Base UI + Tailwind CSS semantic tokens | Accepted | Application-owned, accessible primitives and consistent customization | Shared UI exports isolate primitive replacement |
| API | Fastify + REST/JSON + OpenAPI | Accepted | Dedicated high-performance, client-neutral contract | Contract survives framework replacement |
| Database | Supported PostgreSQL | Accepted | Transactions, ranges, exclusions, exact types, RLS | PostgreSQL provider is portable; vendor is not abstracted away |
| Data access | Kysely + `pg` | Accepted | Thin typed SQL and explicit PostgreSQL access | Repository-by-repository replacement |
| Schema change | Ordered reviewed SQL migrations | Accepted | Specialized DDL remains visible and authoritative | Standard PostgreSQL migration ledger |
| Authentication | Better Auth in separate `auth` schema | Accepted | Audited mechanics without outsourcing domain authorization | Explicit subject mapping supports replacement |
| Authorization | Application-owned memberships/roles/venue scope + RLS | Accepted | Matches domain and provides defense in depth | Not delegated to auth vendor |
| Queue | BullMQ over managed Valkey | Accepted, spike required | Delays, retries, worker scaling, Node ecosystem | Outbox/due tables allow queue replacement/recovery |
| Production platform | DigitalOcean App Platform, Bangalore | Conditional selection | Closest complete managed shortlist and simple operations | Render Singapore |
| Managed data | DigitalOcean PostgreSQL + Valkey, co-located | Conditional selection | Managed recovery/private binding and low operator load | Render PostgreSQL/Key Value or another managed PostgreSQL/Valkey |
| Object storage | DigitalOcean Spaces, Bangalore | Conditional selection | S3-compatible, co-located, simple baseline | Any S3-compatible service |
| Edge/DNS | Cloudflare | Conditional selection | Independent DNS, proxy, DDoS, basic WAF/rate rule | DNS cutover to another authority/proxy |
| Observability | OpenTelemetry + Better Stack | Accepted | One solo-friendly backend for telemetry and uptime | Grafana Cloud/other OTLP backend |
| OTP/SMS | `sms.bd` first candidate | Delivery gate required | Local REST/OTP/masking/pricing posture | BulkSMS.BD; Twilio for suitable routes |
| Transactional email | Resend | Conditional selection | Simple API, useful free allowance, regional sending | Any email adapter |
| Booking messaging | In-app state + secure share link baseline | Accepted | Works without delivery-vendor promise | Add proven SMS/email channels |
| Repository | pnpm workspace, no initial orchestrator | Accepted | One atomic codebase with low tooling overhead | Add Turborepo/Nx when measured |
| Native application | Not selected | Intentionally deferred | Web ships first; API/auth contracts prepare the path | Decide React Native/Expo or other client from later requirements |
| Payment gateway | Not selected | Intentionally open | Merchant settlement/legal/operational fit is unproven | Manual transaction records remain MVP baseline |

## Exact versions

Architecture selects supported lines and compatibility criteria, not floating
latest dependencies. Phase 4 records a tested version manifest after:

1. installing the current stable releases;
2. verifying Node LTS, Next.js, Fastify, Better Auth, Kysely, `pg`, BullMQ,
   OpenTelemetry, and PostgreSQL compatibility together;
3. running a minimal auth/session, RLS, migration, queue, and trace spike;
4. committing one lockfile and container base digest;
5. enabling controlled dependency update checks.

Release candidates cannot own booking, money, tenancy, or authentication
correctness without an explicit exception ADR.

## Authentication boundary

```text
Better Auth
  owns credential challenge and browser session mechanics
        │ explicit auth_subject_id
        ▼
Application identity
  owns account status and security version
        │
        ├── tenant membership + fixed role
        ├── venue scope
        ├── private customer relationships
        └── platform permissions
```

This keeps future mobile and integration authentication possible without
turning a library's organization model into the business domain.

## Provider activation checklist

### DigitalOcean

- [ ] Account creation, billing, and Bangladesh payment method work.
- [ ] BLR app, PostgreSQL, Valkey, and Spaces availability confirmed in account.
- [ ] Required PostgreSQL extensions and permissions pass migration rehearsal.
- [ ] Dhaka fixed/mobile measurements pass performance budgets.
- [ ] Private URLs, pool limits, RLS context, TLS, and secret rotation pass.
- [ ] Point-in-time restore and application reconciliation meet RPO/RTO.
- [ ] BullMQ crash/retry/dedup/recovery passes on managed Valkey.
- [ ] Monthly quote and upgrade triggers are approved.

### SMS

- [ ] Legal business/sender identity requirements understood.
- [ ] Masking/non-masking sender behavior confirmed.
- [ ] OTP delivery and latency sampled across four major operator routes.
- [ ] Delivery receipts, webhook authentication, rate limits, and support tested.
- [ ] Failure/fallback behavior passes without booking corruption.
- [ ] Real per-message/VAT/recharge terms recorded.

### Better Stack and Resend

- [ ] Data location/retention and privacy inventory approved.
- [ ] Telemetry redaction and sampling tests pass.
- [ ] Alert/heartbeat drill wakes the founder through an available channel.
- [ ] Email domain SPF, DKIM, DMARC, bounce, and complaint handling pass.
- [ ] Neither provider failure blocks domain commits.

## What remains intentionally open

These are not missing Phase 3 architecture decisions:

- the payment gateway, because settlement and merchant eligibility need
  commercial/legal evidence;
- exact infrastructure tier at launch, because it depends on measured load and
  accepted availability cost;
- a native mobile framework, because no native client is in the MVP;
- SMS production activation, because provider claims cannot replace delivery
  tests;
- paid telemetry retention, because real volume is not yet known.

Their boundaries, gates, and fallbacks are defined, so implementation can
proceed without pretending the unknowns are solved.

## Governing ADRs

- [ADR-001: Modular monolith](adrs/ADR-001-modular-monolith.md)
- [ADR-002: API-first contracts](adrs/ADR-002-api-first-contracts.md)
- [ADR-003: Runtime and frameworks](adrs/ADR-003-typescript-runtime-and-frameworks.md)
- [ADR-004: PostgreSQL and tenancy](adrs/ADR-004-postgresql-and-tenancy.md)
- [ADR-005: Capacity concurrency](adrs/ADR-005-capacity-concurrency.md)
- [ADR-006: Lean managed infrastructure](adrs/ADR-006-lean-managed-infrastructure.md)
- [ADR-007: SQL access and migrations](adrs/ADR-007-sql-access-and-migrations.md)
- [ADR-008: Authentication and OTP](adrs/ADR-008-authentication-and-otp.md)
- [ADR-009: Cloud and region](adrs/ADR-009-initial-cloud-and-region.md)
- [ADR-010: Jobs and outbound providers](adrs/ADR-010-jobs-and-outbound-providers.md)
- [ADR-011: Observability](adrs/ADR-011-observability.md)
- [ADR-012: Repository and package management](adrs/ADR-012-repository-and-package-management.md)
- [ADR-013: shadcn/ui design system](adrs/ADR-013-shadcn-ui-design-system.md)
