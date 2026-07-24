# Architecture and Product Test Strategy

Status: Phase 3 test baseline

## Objective

Prove correctness at the cheapest reliable layer while giving the highest-risk
properties—tenant isolation, booking concurrency, money, time, retry, and
recovery—real PostgreSQL and system-level tests.

The 110 Phase 2 acceptance criteria remain the behavioral source. Architecture
tests add proof that behavior survives concurrency, failure, scale, and hostile
inputs.

## Test layers

| Layer | Proves | Typical speed/environment |
|---|---|---|
| Domain unit/property | Value objects, calculations, transition/invariant logic | Very fast, no network/database |
| Application use-case | Authorization orchestration, command/query results, port interaction | Fast with controlled fakes |
| PostgreSQL integration | Constraints, locks, RLS, composite FKs, transactions, migrations, query semantics | Real supported PostgreSQL |
| Contract/schema | OpenAPI/runtime validation, generated client, compatibility, error shapes | CI |
| Adapter integration | OTP/queue/storage/payment/webhook translation and signatures | Provider sandbox/local emulator/fake server |
| End-to-end | Actor workflows through browser/API/worker/database | Production-like test environment |
| Concurrency/fault | Races, retries, unknown commit, worker/process crash | Dedicated repeatable harness |
| Performance/load | NFR p95/p99, pool/lock/queue behavior, noisy tenant | Production-like sized fixture |
| Security/abuse | Threat register, tenant/role/scope, input/browser/API attacks | CI plus scheduled deeper scan |
| Recovery/operations | Backup restore, deployment/migration/alerts/runbooks | Isolated infrastructure drill |
| Accessibility/browser | WCAG core tasks, responsive and supported browser behavior | Automated + manual task review |

## Fixture strategy

Reuse all six synthetic venue archetypes:

| Fixture | Pressure focus |
|---|---|
| V-01 Single Turf | Hot slot, simple staff/public flow |
| V-02 Multi-Court Badminton | Similar resources, high turnover, customer duplicates |
| V-03 Mixed-Sport Complex | Role/scope, reports, payments, blocks, busy Today |
| V-04 Cricket Practice | Different contact/participant and walk-in behavior |
| V-05 Late-Night Venue | Cross-midnight operational date and handover |
| V-06 Multi-Venue Future | Tenant/venue scope and architecture pressure without MVP UI |

Fixtures are deterministic, generated, non-personal, versioned, and usable at:

- minimal unit/integration size;
- E0 working performance size;
- E1 generated scale size.

## Critical proof suites

### Tenant and authorization

- two/three tenant fixtures for every repository/endpoint;
- every fixed profile × allowed/forbidden action;
- assigned/unassigned/business-wide venue scope;
- direct endpoint/UI bypass;
- lists, aggregates, exports, cache, jobs, and secure tokens;
- pooled connection context reuse;
- runtime role cannot bypass RLS or mutate audit;
- platform and partner roles have no implied tenant super-access.

### Capacity concurrency

- 50+ simultaneous identical claims → exactly one active success;
- back-to-back ranges both succeed;
- hold completion versus expiry;
- booking versus urgent block;
- reschedule/extension/reassignment versus new booking;
- two-resource lock-order test;
- API crash/timeout around commit and idempotent recovery;
- repeated randomized interval property tests.

### Money

- exact minor-unit addition/allocation;
- advance percentage rounding;
- several partial collections;
- verification accept/reject/duplicate;
- reversal and partial/full refund limits;
- retry/provider duplicate;
- report/drill-down reconciliation;
- SaaS ledger never included in venue ledger.

### Time

- Asia/Dhaka midnight/operational boundary;
- cross-midnight interval;
- schedule/price exception precedence;
- fake server/client clock;
- non-Dhaka DST gap/fold;
- timezone/configuration change after snapshot;
- delayed expiry/reminder execution.

### Outbox/jobs

- crash before and after provider call;
- duplicate outbox/queue delivery;
- missed scheduler then database sweep;
- source becomes ineligible before execution;
- per-tenant fairness;
- poison event/schema quarantine;
- backlog/failed-worker alert.

## Property-based tests

Generate:

- time ranges and overlap/adjacency;
- price lines, percentages, allocations, refunds;
- legal/illegal state-transition sequences;
- role/permission/venue combinations;
- idempotency request hashes/retries;
- schedule/exception/price-rule combinations.

Properties include:

```text
no overlapping active claim after any successful sequence
net paid reproducible from transactions
refund/reversal never exceeds source remainder
tenant foreign reference always same business
terminal transition cannot return to active without explicit new aggregate
equivalent idempotent retry does not increase effect count
```

## Migration tests

CI:

1. migrate empty database to head;
2. load prior release schema/fixture and migrate to head;
3. run integrity and report totals;
4. verify rollback only where migration explicitly supports it;
5. detect dangerous locks/rewrite patterns through review/test;
6. ensure application runtime role has required—but not owner—privileges.

Large backfills test restart/checkpoint and mixed old/new application versions.

## API contract tests

- Runtime schema and OpenAPI agree.
- Generated TypeScript client compiles and exercises representative endpoints.
- Unknown/mass-assignment fields follow documented reject/strip policy.
- Error codes are stable and safe.
- Cursor pagination has no duplicate/missing items under stable ordering.
- Breaking partner/public changes fail compatibility diff.
- Old mobile-client contract fixture remains supported during policy window.
- Idempotency, version/ETag, correlation, amount-string, and time formats pass.

## Browser and accessibility tests

Core tasks:

- sign in/invitation;
- Today;
- staff quick booking;
- payment verification and correction;
- block/resolution;
- public booking and secure result;
- report drill-down;
- restriction/access error.

Test keyboard, focus, labels, error announcements, status not by color, 320px
width, current supported browsers, slow/stale/offline display, double submit,
and reduced motion where relevant.

Automated accessibility results do not replace manual keyboard/screen-reader
task review.

## Performance tests

Measure real workflows, not only HTTP framework overhead:

- Today initial and filter query;
- 7-day availability;
- booking commit under low and hot contention;
- customer search;
- owner reports and export;
- outbox/notification backlog drain;
- public page/checkout.

Collect:

```text
p50/p95/p99 end-to-end latency
throughput and error/conflict rate
database CPU/IO/query plans/lock wait
connection pool wait/saturation
queue age/drain rate
process CPU/memory/event-loop delay
per-tenant fairness
```

Tests use Phase 2 NFR thresholds and both warm/cold-relevant conditions.

## Security tests

- dependency, secret, static analysis, container/image scan;
- authentication/session/CSRF/CORS/CSP/browser storage;
- injection, mass assignment, unsafe filter/sort;
- rate/OTP/hold abuse;
- secure token entropy, expiry, revocation, referrer/log leakage;
- webhook signature/replay/SSRF;
- export/object-storage access;
- log/trace redaction canaries;
- threat-register regression IDs mapped to tests.

Automated scanners supplement, not replace, domain-specific authorization and
business-logic abuse tests.

## Recovery and operational tests

- timed PostgreSQL PITR/backup restore into isolated environment;
- application integrity/reconciliation after restore;
- Redis loss and outbox/sweeper recovery;
- worker kill and lease recovery;
- bad deployment rollback/forward fix;
- migration failure/lock timeout;
- secret/session/partner-key rotation;
- alert firing and notification route;
- simulated provider outage/circuit.

## CI lanes

### Every change

- format/lint/type/import architecture;
- domain/application unit/property subset;
- PostgreSQL migration + integration;
- contract/generated client;
- authorization/security critical subset.

### Main/release candidate

- full unit/integration/contract suite;
- browser E2E/accessibility automated checks;
- concurrency/fault suite;
- dependency/image/secret scans;
- production build and migration rehearsal.

### Scheduled/pre-beta

- E0/E1 performance;
- deep security/abuse;
- backup restore and operational drills;
- browser/manual accessibility matrix.

Tests are parallelized and deterministic; flaky tests are treated as defects,
not retried indefinitely until green.

## Coverage and release gates

Coverage percentage alone is not a release metric. Required traceability:

```text
Scenario → acceptance criterion → workflow/story
→ domain invariant/use case → API/screen/job
→ automated/manual test IDs
```

Release blocks on:

- any failed P0 acceptance;
- tenant/venue/role isolation failure;
- capacity concurrency failure;
- money/reconciliation mismatch;
- migration/restore failure;
- known unassessed critical/high exploitable security issue;
- unmet Phase 2 P0 NFR;
- missing observable recovery for failed critical jobs.

## Test ownership for a solo developer

- Keep the suite layered so most failures localize quickly.
- Generate fixtures instead of maintaining enormous hand-written data.
- Make concurrency/recovery harnesses reusable.
- Prefer contract/architecture automation over memory/checklists.
- Keep manual release steps minimal, explicit, and rehearsed.
- Record intentionally accepted risk rather than silently skipping a gate.
