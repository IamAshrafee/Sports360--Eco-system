# Phase 5 Staff-Side Booking Core Delivery Plan

Status: Implementation active; P5-01 complete

Last reviewed: 2026-07-24

## Objective

Deliver the staff-side source of truth for a one-venue Bangladeshi sports
business: sellable venue configuration, internal availability, conflict-safe
staff bookings, tenant-local customers, booking lifecycle, exact payment
records, Today operations, and reconcilable core reports.

Phase 5 finishes when the four roadmap exit conditions are demonstrated:

1. busy-day internal simulations pass;
2. a trained standard staff booking completes in under one minute;
3. report aggregates reconcile with their source records;
4. concurrency tests prove the system cannot create a conflicting booking.

## Scope boundary

Included:

- business, venue, activity, independent-resource, and offering configuration;
- fixed schedules, fixed slots, price rules, policy versions, add-ons, and
  resource blocks;
- internal availability and staff-assisted bookings;
- guest, returning, team/organization contact, and customer-management needs;
- pending/confirmed/cancelled/expired booking commitment;
- reschedule, extension, reassignment, attendance, completion, and no-show;
- cash and manual bKash/Nagad transaction records, verification, reversal,
  refund, dues, and reconciliation;
- Today and the agreed core reports/exports.

Excluded:

- public pages, public checkout, OTP customer booking, and temporary public
  holds (Phase 6);
- production SMS/email delivery;
- native mobile, partner API, widgets, or webhooks;
- multiple active pilot venues, flexible/recurring bookings, composite or
  divisible resources, memberships/packages, gateway settlement, accounting,
  payroll, and marketplace behavior.

Future-client compatibility is required; future feature implementation is not.

## Entry state

Phase 4 already provides:

- Node `24.18.0`, pnpm `11.17.0`, CI, lint/type/test/build gates;
- separate web, API, and worker processes;
- versioned `/v1` Fastify/OpenAPI and generated TypeScript client;
- identity, tenant membership, fixed profiles, venue scope, RLS, audit,
  idempotency records, and outbox;
- `venues`, initial `resources`, `resource_units`, and constrained
  `capacity_claims`;
- shared shadcn/Base UI tokens and starter primitives;
- deterministic demo tenants and real PostgreSQL integration tests.

Do not rebuild these foundations. Extend them through forward migrations and
existing package boundaries.

## Preflight decisions and reconciliations

These items must be settled in the first implementation slice:

1. **API prefix:** `/v1` is canonical because it is the implemented and
   contract-tested Phase 4 boundary. The older `/api/v1` wording is corrected
   in the architecture document; no route alias is added without evidence.
2. **Activities:** replace the temporary free-form `resources.activity_code`
   seam with tenant-owned activity records and explicit resource/offering
   compatibility through a forward migration. Preserve existing seed meaning.
3. **Independent resources:** Phase 5 UI and use cases expose one capacity unit
   per independent resource. Existing generalized unit storage does not
   authorize composite/divisible-resource features.
4. **Blocks:** implement `resource_blocks` separately from capacity claims so
   an urgent block may overlap existing bookings and create resolution work.
   Do not use `capacity_claims.claim_type = 'BLOCK'` for this behavior; remove
   or retire that unused physical option through a reviewed forward migration.
5. **Physical/domain names:** the physical table may remain
   `capacity_claims`; application/domain language is `CapacityClaim`. A rename
   is unnecessary unless it produces measured clarity greater than migration
   risk.
6. **Configuration concurrency:** editable configuration uses version/ETag
   checks. Retriable effect-producing commands use idempotency keys.
7. **Public holds:** the schema may preserve a future `HOLD` seam, but no public
   hold workflow or endpoint enters Phase 5.

## Delivery principles

- Build vertical slices that end in an observable staff outcome.
- Keep domain rules out of HTTP handlers and React components.
- Every tenant row carries `business_id`; every protected command validates
  membership, permission, and venue scope before protected reads/writes.
- Database constraints and locks own hard capacity invariants.
- Booking, payment, and attendance remain separate state dimensions.
- Booking contact, price, offering, policy, source, actor, and applicable time
  facts are immutable snapshots.
- Financial history is append-only and exact in integer minor units.
- API schemas, OpenAPI, generated client, and first-party usage change
  together.
- Add shadcn primitives only when a planned screen needs them.
- No external provider call occurs inside a domain transaction.

## Slice map

| Slice | Staff-visible outcome | Primary trace |
|---|---|---|
| P5-00 | Phase boundary and contract/schema contradictions are resolved without product behavior | ADR-002; Phase 4 evidence; preflight list |
| P5-01 | Owner manages activity, independent resource, and offering configuration | WF-CFG-001; US-CFG-001–002; AC-CFG-001–002 |
| P5-02 | Owner defines operating hours and sees valid fixed internal slots | US-CFG-003; AC-CFG-003; INV-TIM-001–002 |
| P5-03 | Each slot resolves one price and policy; add-ons remain non-capacity | US-CFG-004–007; AC-CFG-004–007, AC-CFG-012 |
| P5-04 | Staff sees internal availability; managers create safe resource blocks | US-CFG-009; US-OPS-004; AC-OPS-005–006 |
| P5-05 | Staff creates/selects a tenant-local guest or returning contact | WF-CUS-001–002; US-CUS-001–003, 006–007; AC-CUS-001–002, 005, 007–009 |
| P5-06 | Staff commits a price-snapshotted booking without conflicts | WF-BKG-001; US-BKG-001–002, 010; AC-BKG-001, 004, 007; AC-NFR-001–003 |
| P5-07 | Pending/confirmed bookings can reschedule or cancel with history | WF-BKG-002–004; US-BKG-004–006; AC-BKG-006, 008–010 |
| P5-08 | Staff records attendance, no-show, extension, and reassignment safely | WF-OPS-001, 003, 005; US-BKG-007–009; AC-BKG-011–016 |
| P5-09 | Staff records and corrects exact booking money | WF-PAY-001–004; US-PAY-001–008; AC-PAY-001–011 |
| P5-10 | Staff runs Today, walk-ins, handover, and cash close | WF-OPS-001–006; WF-PAY-005; US-OPS-001–010; AC-PAY-012; AC-OPS-001–016 |
| P5-11 | Authorized users drill from core metrics to matching source records | WF-RPT-001–002; US-RPT-001–008; AC-RPT-001–012 |
| P5-12 | All Phase 5 scenarios pass as one coherent internal system | Phase 5 exit conditions; V-01–V-06; AC-NFR-001–012 |

P5-00 is a small reconciliation step and may be completed inside the P5-01
change. It is listed separately so contradictions cannot be hidden in feature
work.

## Detailed slice gates

### P5-01 — Configuration core

Deliver:

- forward schema for tenant-owned activities and offerings;
- explicit offering/resource compatibility;
- safe resource state/version behavior;
- tenant-scoped application commands/queries and `/v1` API contracts;
- generated client;
- Setup screens for list/create/edit at mobile and desktop sizes;
- deterministic V-01 and V-03 fixtures;
- RLS, composite-FK, permission, API, UI, and accessibility tests.

Exit:

- an Owner/authorized Manager can create and retrieve valid configuration;
- Finance/Reports and cross-tenant actors cannot mutate or enumerate it;
- an offering cannot reference another venue/tenant or lack a compatible active
  independent resource.

Implementation-ready brief:
[P5-01 configuration core](phase-5/P5-01-configuration-core.md).

Implementation evidence:
[Phase 5 configuration core](../engineering/phase-5-configuration-core.md).

### P5-02 — Schedule and fixed slots

Deliver:

- versioned venue/resource weekly schedules and explicit exceptions;
- fixed duration/boundary rules;
- a pure slot-generation application service;
- preview query/API/UI with timezone and operational-date context;
- cross-midnight and non-Dhaka DST test vectors without adding flexible
  booking.

Exit:

- generated slots are non-overlapping, half-open, and entirely inside the
  effective schedule;
- edits do not reinterpret already-snapshotted booking times.

### P5-03 — Price, policy, and add-ons

Deliver:

- price rule sets with deterministic precedence and explainable source;
- immutable/effective policy versions;
- exact BDT price and percentage rules;
- amenities and simple priced add-ons that do not allocate capacity;
- preview UI combining slot, price source, and policy.

Exit:

- one and only one active price resolves for a bookable slot;
- ambiguous equal-priority rules are rejected;
- future changes cannot alter historical snapshot equivalence.

### P5-04 — Internal availability and blocks

Deliver:

- availability query derived from schedules, exceptions, active claims, and
  resource blocks;
- manager block commands and affected-booking resolution records;
- cache-free correct first implementation with clear future cache seams;
- calendar/availability API and internal screen states.

Exit:

- stale reads can cause a safe conflict but never a double booking;
- a free-period block prevents new claims;
- an urgent overlapping block preserves all affected bookings as unresolved
  work instead of cancelling them.

### P5-05 — Customer/contact core

Deliver:

- tenant-local guest profiles and contacts;
- Bangladesh phone normalization/search;
- possible-duplicate warning without automatic merge;
- responsible contact, payer, participant/guardian, team/organization, and
  explicit anonymous walk-in representation;
- restricted tenant/venue-scoped queries.

Exit:

- staff can identify a booking contact without registration;
- no query returns cross-tenant suggestions;
- no invented customer is created for an anonymous walk-in.

Customer merge, restrictions, notes, and tags may be a contained follow-up
inside P5-05 if the first booking slice does not require them.

### P5-06 — Staff booking commit

Deliver one atomic command:

```text
authorize
→ lock/resolve idempotency
→ lock resource guard
→ recheck configuration/schedule/price/policy/block
→ create constrained claim
→ create booking and immutable snapshots
→ append audit and outbox
→ store idempotent result
→ commit
```

Deliver API, generated client, quick-booking UI, conflict recovery, and
PostgreSQL concurrency harness.

Exit:

- 50+ simultaneous equivalent target requests create at most one active
  reservation;
- back-to-back slots both succeed;
- an equivalent retry returns the same logical booking;
- cross-tenant, wrong-venue, wrong-permission, stale, and conflict paths leave
  no partial booking/customer/money/outbox truth.

### P5-07 — Commitment lifecycle

Deliver:

- Pending, Confirmed, Expired, CancelledCustomer, and CancelledVenue
  transitions;
- deadline expiry worker behavior;
- conflict-safe reschedule;
- cancellation with separate financial-resolution state;
- booking revisions, optimistic concurrency, audit, and outbox events.

Exit:

- old capacity remains unchanged if a target reschedule fails;
- expiry and cancellation release capacity once;
- late payment never silently reactivates an expired booking.

### P5-08 — Attendance and capacity changes

Deliver:

- independent attendance events/state;
- late attention, check-in, start, complete, and no-show;
- conflict-safe extension and compatible-resource reassignment;
- before/after booking revisions and explicit price/due consequences.

Exit:

- attendance never rewrites booking/payment truth;
- a conflicting extension/reassignment rolls back completely;
- stable resource-lock ordering prevents cross-resource deadlock patterns.

### P5-09 — Payments and corrections

Deliver:

- payment attempts, immutable transactions, and allocations;
- cash success and manual MFS pending/verified/rejected states;
- fixed/percentage advance calculation;
- multiple partial payments and derived due;
- linked reversal and partial/full refund;
- exact API/UI money strings or integer minor units.

Exit:

- all balances reproduce from source transactions;
- a correction never overwrites an original;
- refund/reversal cannot exceed source remainder;
- duplicate references and idempotent retries cannot double-count money.

### P5-10 — Today and reconciliation

Deliver:

- operational-date Today query and mobile-first workspace;
- current/upcoming/pending/due/late/blocked groupings;
- walk-in using the same booking/payment/attendance commands;
- maintenance/affected-block tasks where required;
- shift handover and cash-session close;
- explicit stale/offline read-only presentation.

Exit:

- standard booking path is measured under one minute after the scripted
  training assumption;
- stale data is never presented as a confirmed mutation;
- unresolved items remain visible after handover/close.

### P5-11 — Reports and export

Deliver:

- documented metric definitions with date basis and formulas;
- booking value, collection, service revenue, due, occupancy, downtime,
  reserved/played utilization, channel, customer, and exception views;
- tenant/venue/permission-scoped drill-down;
- filtered CSV with timezone, currency, filters, and generation metadata.

Exit:

- every aggregate equals the exact sum/count of the drill-down population;
- booking value, collections, service revenue, and cash variance never share a
  misleading total;
- Booking Staff cannot call protected exports directly.

### P5-12 — Integrated phase gate

Run:

- V-01 single-turf normal and collision paths;
- V-02 high-turnover multi-court operations;
- V-03 mixed-complex roles, money, blocks, Today, and reports;
- V-04 contact/organization and walk-in paths;
- V-05 after-midnight operational date;
- V-06 multi-venue pressure tests without multi-venue pilot UI.

Required evidence:

- full repository gate and clean generated-contract diff;
- concurrency/fault/idempotency suite;
- cross-tenant and venue-scope suite;
- report reconciliation;
- responsive, keyboard, focus, and error-state workflow checks;
- backup/restore rehearsal including the new booking/financial relations;
- measured standard-booking and busy-Today performance.

## Test ownership by layer

| Layer | Phase 5 responsibility |
|---|---|
| Domain unit/property | money, rules, price precedence, transitions, time ranges |
| Application use case | authorization orchestration, snapshots, ports, idempotent outcomes |
| PostgreSQL integration | RLS, composite FKs, constraints, locks, migrations, concurrency |
| API contract | runtime schema, OpenAPI, errors, generated client, pagination/versioning |
| UI/component | keyboard, labels, focus, state combinations, responsive/error/loading |
| End-to-end | setup → availability → customer → staff booking → payment → Today → report |
| Fault/recovery | duplicate, unknown commit, expiry race, worker retry, restore |

## Work-control rules

- Only one slice is implementation-active at a time for the solo developer.
- A slice begins with a task brief and ends with fresh evidence and a handoff.
- New schema always uses a new ordered migration; migrations `001`–`004` are
  immutable history.
- Do not begin P5-06 booking commits until P5-01–P5-04 invariants are proven.
- Do not begin report UI before source transaction/state definitions exist.
- If a slice reveals missing product behavior, record an open question rather
  than improvising scope.
- A public/future seam may be tested as compatibility but cannot expose a
  Phase 6 feature.

## Immediate next action

Prepare and implement only P5-02 Schedule and Fixed Slots. Preserve the P5-01
configuration boundaries and do not start pricing, availability, booking,
public publication, or payment behavior in the same task.
