# Architecture Foundations and Decision Gates

Status: Confirmed foundation

## Objective

Build a modern TypeScript SaaS that can begin inexpensively, remain operable by
one developer, and scale through replication, partitioning, and selective
module extraction without rewriting its transactional core.

The hardest scaling problem is not HTTP throughput. It is preserving one
correct result when many actors compete for the same resource and time while
payments, holds, expiry jobs, reports, and notifications run concurrently.

## Scalability dimensions

| Dimension | What must scale safely |
|---|---|
| Tenant | More businesses without cross-tenant access or noisy-neighbor failure |
| Transaction | Hot-slot contention without duplicate capacity or money |
| Data | Growing booking, transaction, audit, notification, and report history |
| Read traffic | Today, calendars, public availability, and reports |
| Async work | Expiry, reminders, delivery, exports, and reconciliation |
| Deployment | Horizontal API/worker replicas and safe low-downtime releases |
| Operations | Monitoring, backup, restore, incident response, and cost |
| Development | One person can understand, test, deploy, and change the system |

Optimizing only requests per second would ignore the most expensive failure
modes.

## Draft scale envelopes

These are architecture targets, not demand forecasts or launch-capacity
promises.

| Envelope | Business scale | Load shape | Architecture expectation |
|---|---|---|---|
| E0 Pilot | Up to 100 businesses, one active venue each, 2–10 resources | Up to 250 concurrent sessions; 50 competing attempts in a hot-slot test | One primary PostgreSQL cluster; horizontally scalable web/API/worker |
| E1 Growth | Up to 10,000 businesses and 100,000 active resources | Up to 20,000 concurrent sessions; approximately 1 million booking/payment mutations per day with bursts | Larger/replicated database, connection pooling, read optimization, partition large append-only tables when measurements justify it |
| E2 Platform | Beyond E1 or sustained regional/enterprise demand | Regional latency, very large audit/event history, extreme hot tenants | Tenant-aware partition/shard placement and selective service extraction based on measured bottlenecks |

The design should be structurally compatible with E1 from the beginning while
paying mainly for E0. E2 requires explicit later work; claiming unlimited scale
now would be dishonest.

## Proposed topology

```text
Browser / Mobile Web
        │
        ▼
Next.js Web Application
        │ typed HTTPS API
        ▼
Stateless TypeScript API
        │
        ├──────────────► PostgreSQL (system of record)
        │
        ├──────────────► Redis-compatible service (queue/cache/rate limits)
        │
        └──────────────► Object storage (exports/assets)

Transactional outbox
        │
        ▼
TypeScript Worker
        ├──────────────► Notification providers
        ├──────────────► Expiry/reminder processing
        └──────────────► Exports and projections

All processes ─────────► OpenTelemetry-compatible observability
```

This is a **modular monolith with three deployable process types**, not three
independent business services:

- `web` owns rendering and browser interaction;
- `api` owns domain use cases, authorization, and transactions;
- `worker` owns retried asynchronous use cases;
- all business modules remain in one repository and one versioned application
  boundary.

Web, API, and worker can scale independently. Domain modules can later be
extracted only when their load, ownership, or failure characteristics justify
the operational cost.

## Proposed module boundaries

```text
Identity
Tenancy & Access
Business & Venue Configuration
Availability & Capacity
Bookings
Customers & Contacts
Payments & Reconciliation
Today Operations
Reporting & Audit
Notifications
Subscriptions & Entitlements
Platform Administration
```

Rules:

- a module exposes application commands, queries, and events;
- another module cannot mutate its tables directly through ad hoc code;
- cross-module synchronous calls remain in-process initially;
- committed domain events reach asynchronous handlers through a transactional
  outbox;
- reporting may use read models, but every total stays traceable to source
  records.

## Recommended foundations

These decisions are approved and recorded in the ADR collection.

| Gate | Recommendation | Why it fits | Main consequence |
|---|---|---|---|
| A. Architecture style | Modular monolith; separate web/API/worker deployables | Strong transactions and one-developer operability with clean growth seams | Requires disciplined module boundaries |
| B. Language/runtime | Strict TypeScript on current production LTS Node.js | Matches founder skill, broad ecosystem, shared domain/client types | Runtime upgrades follow LTS policy, not novelty |
| C. Web | Next.js App Router/React | Mobile web, public SSR/SEO, staff application, mature deployment choices | Keep domain transactions out of UI/server-component code |
| D. API | Fastify with schema-first validation and REST/OpenAPI | Low framework overhead, explicit contracts, future mobile/integration friendly | Separate API lifecycle adds some setup |
| E. Database | Current supported PostgreSQL | Transactions, exact numeric/time, ranges, constraints, RLS, indexes | Deliberate use of PostgreSQL capabilities |
| F. Data access | Kysely + `pg` with ordered reviewed SQL migrations | Keeps queries/invariants visible and supports PostgreSQL-specific constraints | SQL review remains necessary |
| G. Tenancy | Shared schema, mandatory `business_id`, tenant-safe references, application authorization, PostgreSQL RLS as defense in depth | Efficient for many SMB tenants and compatible with future tenant partitioning | Context/pool handling and RLS tests must be rigorous |
| H. Booking conflicts | PostgreSQL `tstzrange` `[)` plus GiST exclusion for active capacity reservations | Database prevents overlap across API replicas | Reservation-state and expiry transactions need proof |
| I. API contracts | Versioned REST/JSON with OpenAPI and generated TypeScript client | Clear boundary and portable future clients | More explicit schemas than direct RPC |
| J. Async work | Transactional outbox plus BullMQ over managed Valkey | No event loss between database commit and delivery | Handlers must tolerate repeated delivery |
| K. Cache | Redis-compatible cache only for measured read/rate-limit needs | Improves speed without owning truth | System remains correct during cache loss |
| L. Observability | OpenTelemetry/structured logs to Better Stack | Vendor portability and one-console solo operation | Sampling, privacy, retention, and cost controls apply |
| M. Deployment | DigitalOcean App Platform + managed data in Bangalore, gated by measurements; Render Singapore fallback | Portability, low expected Bangladesh latency, lower operational burden | Provider must pass latency, restore, compatibility, and cost gates |

## Why PostgreSQL is central

PostgreSQL directly represents timestamp ranges and overlap operations. Its
official documentation uses reservations as the scheduling example and shows a
GiST exclusion constraint preventing overlapping room reservations. That
matches the independent-resource booking invariant:

```sql
EXCLUDE USING gist (
  resource_id WITH =,
  reserved_during WITH &&
)
```

The production constraint will also include tenant identity and a predicate or
reservation-state design covering only capacity-reserving rows. Holds, pending
reservations, confirmed bookings, expiry, reschedule, extension, and
reassignment must all commit through this invariant.

PostgreSQL Row-Level Security can create a default-deny layer for tenant-owned
rows, but it is not the sole authorization system. Table owners and roles with
`BYPASSRLS` can bypass it, and complex policy subqueries can introduce
performance or race concerns. Therefore:

```text
Application permission + venue scope
AND tenant-safe schema/foreign keys
AND RLS defense in depth
AND cross-tenant negative tests
```

The application runtime must not connect as a table owner or bypass-RLS role.

## Why not microservices now

The initial booking path requires tightly consistent changes across capacity,
booking snapshot, customer contact, payment requirement, audit, idempotency,
and outbox. Splitting these into network services now would add:

- distributed transaction or compensation design;
- more failure combinations and eventual-consistency states;
- service discovery, versioning, deployment, and observability overhead;
- higher cloud cost;
- slower refactoring while domain boundaries are still being learned.

The modular monolith retains boundaries in code and data ownership. A future
module becomes a service when measured scale, independent release need, failure
isolation, or team ownership makes that trade worthwhile.

## Performance principles

1. Correct query/index design before cache.
2. Short database transactions around invariants only.
3. No provider/network call inside a booking or payment transaction.
4. Connection pooling with explicit upper bounds.
5. Cursor/keyset pagination for large operational histories.
6. Add report projections only when source-query measurements require them.
7. CDN-cache published/static content, never live capacity beyond an explicitly
   safe freshness window.
8. Use read replicas only for replica-safe reads, never a decision requiring
   just-committed capacity or payment truth.
9. Partition large append-only tables after size/query evidence.
10. Benchmark the real booking transaction and Today fixture; framework
    “hello world” throughput is only a small input.

## Reliability principles

- The same idempotency key and request hash return one logical mutation.
- The database commit and outbox record are one transaction.
- Queue delivery is assumed to repeat; handlers detect completed effects.
- Expiry competes safely with checkout completion inside database transactions.
- Deployment supports graceful shutdown before terminating in-flight work.
- Backup success is insufficient; a timed restore reconciles known totals.
- Schema changes use expand/migrate/contract when versions overlap.

## Modern technology policy

“Modern” means actively supported, observable, secure, and replaceable—not
automatically the newest release:

- production uses an active or maintenance LTS Node.js line;
- framework majors follow ecosystem compatibility and migration tests;
- PostgreSQL uses a supported stable release;
- interfaces use standard containers, PostgreSQL, S3-compatible storage,
  HTTP/OpenAPI, and OTLP where practical;
- experimental behavior cannot own booking or money correctness.

As of 24 July 2026, Node.js 24 is LTS while Node.js 26 is Current; Node’s own
guidance says production applications should use Active or Maintenance LTS.
PostgreSQL 18 is the current supported stable documentation line, while
PostgreSQL 19 is still a development/beta line. Exact versions will be pinned
in Phase 4 after provider compatibility checks.

## Confirmed decisions

### DG-01: Optimize total system efficiency

**Recommendation:** Prefer maximum reliable throughput per developer-hour and
per infrastructure taka, not the highest synthetic request benchmark.

This still means aggressive performance engineering for availability, booking
commit, Today, and reports.

### DG-02: Use a PostgreSQL-specific core

**Recommendation:** Accept deliberate PostgreSQL dependence for ranges,
constraints, transactions, exact types, indexes, and RLS.

Database portability would weaken the strongest booking invariant and provide
little realistic benefit.

### DG-03: Keep the API separate from Next.js

**Recommendation:** Use Next.js for web rendering and a dedicated Fastify API
for domain transactions, although a Next-only application is quicker to
scaffold.

This protects future native clients/integrations, independent API scale,
worker/domain reuse, and clear authorization boundaries.

### DG-04: Choose managed-infrastructure depth

**Resolution:** Use the lean managed direction. DigitalOcean Bangalore is the
provisional production platform and Render Singapore is the fallback. The
choice is conditional on measured Dhaka latency, PostgreSQL/Valkey
compatibility, restore proof, account availability, and actual cost.

### DG-05: Choose authentication ownership

**Resolution:** Use Better Auth for self-hosted credential/session mechanics in
a separate `auth` schema. Own users, memberships, permissions, customer
relationships, and forced-revocation semantics in the application domain.
Place OTP transport behind a provider adapter with `sms.bd` as the first
delivery-test candidate and BulkSMS.BD as fallback.

## Founder resolution

- The recommended modular-monolith, PostgreSQL-specific, separate Fastify API,
  and lean managed-infrastructure directions are accepted.
- No fixed monthly infrastructure budget is known. Provider selection therefore
  follows the cost-control policy in ADR-006 and must present current monthly
  estimates before approval.
- Web is the only initial client.
- Mobile, additional websites, embeds, and a public integration API are
  important post-MVP clients and are architectural requirements now.
- The complete technology/provider matrix, activation gates, cost envelopes,
  and exits are recorded in
  [Technology and provider selection](technology-and-provider-selection.md) and
  [Provider cost, growth, and exit strategy](provider-cost-and-exit-strategy.md).

## Primary technical references

- [Node.js release and production-LTS policy](https://nodejs.org/en/about/previous-releases)
- [Next.js App Router documentation](https://nextjs.org/docs/app/getting-started)
- [Fastify documentation](https://fastify.dev/docs/latest/)
- [Fastify benchmark and synthetic-benchmark warning](https://fastify.dev/benchmarks/)
- [PostgreSQL ranges and exclusion constraints](https://www.postgresql.org/docs/current/rangetypes.html)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL partitioning guidance](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [OpenTelemetry JavaScript status](https://opentelemetry.io/docs/languages/js/)
