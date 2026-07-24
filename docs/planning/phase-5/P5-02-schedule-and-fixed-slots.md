# P5-02 Schedule and Fixed Slots

Status: Implemented and verified

Phase: 5 — Staff-side booking core

## Outcome

An authorized Business Owner or venue-scoped Manager can define effective
venue or resource operating schedules, add explicit date exceptions, and
preview fixed internal slots for a compatible offering/resource/date. The
preview uses the venue IANA timezone, retains operational-date meaning, and
never presents generated intervals outside the effective schedule.

Implementation evidence:
[Phase 5 schedule and fixed slots](../../engineering/phase-5-schedule-and-fixed-slots.md).

## Traceability

- Workflow: `WF-CFG-001`
- Story: `US-CFG-003`
- Acceptance: `AC-CFG-003`, `AC-AUTH-002`, `AC-AUTH-006`, `AC-NFR-003`,
  `AC-NFR-005`, `AC-NFR-011`, `AC-NFR-012`
- Invariants: `INV-TEN-001`–`INV-TEN-005`, `INV-CAP-002`,
  `INV-TIM-001`–`INV-TIM-002`, `INV-AUD-001`–`INV-AUD-002`
- Screen: `SCR-CFG-006 Schedule & slots`
- Fixtures: V-01 Single Turf, V-05 Late-Night Venue, and non-Dhaka DST vectors

## In scope

- Immutable, effective-dated venue and resource schedule versions.
- Weekly local operating periods.
- Specific operational-date exceptions that close or replace normal periods.
- Venue schedule inheritance with a full resource override when one is
  effective for the requested date.
- Pure fixed-slot generation using the selected offering duration.
- Preview query/API/generated-client/UI with schedule source, timezone,
  operational date, exact instants, and local labels.
- Version timeline, RLS, composite tenant/venue/resource constraints, audit,
  permissions, runtime schemas, and real PostgreSQL tests.
- Cross-midnight, DST gap/fold, adjacency, remainder, and exception test
  vectors.

## Out of scope

- Price or policy resolution.
- Live availability, capacity claims, bookings, holds, or resource blocks.
- Flexible duration, recurring bookings, buffers, composite resources, or
  arbitrary slot step/overlap configuration.
- Public publication, public availability, checkout, or OTP.
- Changing the venue timezone or operational-day boundary.
- Editing or deleting an existing schedule version or exception.
- External timezone, calendar, or recurrence dependencies.

## Reconciled behavior

### Effective versions

- A schedule version applies from `effectiveFrom` inclusive until
  `effectiveUntil` exclusive.
- Creating a version inserts it into the scope timeline. The immediately prior
  version is closed at the new effective date; the next version, when present,
  defines the new version's exclusive end.
- Version content is immutable. A correction creates another version.
- The version snapshots the venue IANA timezone. A later venue-timezone change
  cannot reinterpret exact instants already stored by future bookings.
- A resource version fully replaces the venue schedule on dates where it is
  effective. Without an effective resource version, the venue version is used.

### Weekly periods and exceptions

- ISO weekdays use Monday `1` through Sunday `7`.
- A local period is half-open: `[opensAt, closesAt)`.
- `crossesMidnight` assigns a closing time on the following calendar date.
  The period and generated slots retain the opening date as their operational
  date.
- Weekly periods cannot overlap, including a prior day's cross-midnight
  interval. Adjacent periods are valid.
- One exception may exist per schedule version and operational date:
  - `CLOSED` supplies no periods;
  - `REPLACE` supplies the complete replacement period set.
- Exception periods replace, rather than merge with, recurring periods.
- A reason is optional operational context and is kept out of general logs.

### Fixed slots

- The offering's existing `durationMinutes` is the fixed slot duration.
- Each effective period is partitioned from its opening boundary into
  consecutive exact-duration, half-open slots.
- A trailing remainder shorter than the offering duration produces no partial
  slot.
- Generated output is sorted and non-overlapping. It contains exact RFC 3339
  instants and separate venue-local labels.
- This endpoint is a schedule preview, not availability. It does not inspect
  bookings, holds, claims, blocks, prices, or policies and must say so in the
  UI.

### Timezone and DST policy

- Local schedule boundaries are resolved through the version's IANA timezone.
- A nonexistent boundary in a forward DST gap is rejected with an actionable
  schedule error.
- If a configured boundary is repeated during a backward fold, opening uses
  the earlier matching instant and closing uses the later matching instant.
- Slot duration is exact elapsed minutes after boundary conversion. A normal
  period spanning a gap/fold therefore skips or repeats local clock labels
  while exact instants remain adjacent and non-overlapping.
- `operationalDate`, local calendar values, timezone, and exact instants remain
  distinct API fields.

## Persistence requirements

Add one forward migration after `006`; never edit applied migrations.

Minimum relations:

```text
schedule_versions
weekly_schedule_periods
schedule_exceptions
schedule_exception_periods
```

Requirements:

- every row carries `business_id`;
- schedule scope is one venue plus an optional resource from that same tenant
  and venue;
- composite foreign keys prevent cross-tenant/cross-venue references;
- one version number and one effective start exist per scope;
- version effective ranges cannot overlap;
- period checks reject empty, contradictory, or locally overlapping periods;
- child content cannot be updated/deleted by runtime roles;
- tenant RLS is forced and checks permission plus venue scope;
- read uses `resource.read`; create/timeline update uses
  `resource.configure`;
- successful creation appends a protected audit entry;
- indexes support scope/effective-date resolution and exception lookup.

## Application and API requirements

Minimum operations:

```text
GET  /v1/venues/{venueId}/schedules
POST /v1/venues/{venueId}/schedules
GET  /v1/venues/{venueId}/slot-preview
```

The list may filter by `resourceId` and returns immutable versions with weekly
periods and exceptions. Creation accepts:

```text
resourceId?       absent means venue scope
effectiveFrom
weeklyPeriods[]
exceptions[]
```

Preview requires:

```text
offeringId
resourceId
operationalDate
```

It returns:

```text
scheduleVersionId
scheduleScope: VENUE | RESOURCE
timezone
operationalDate
offeringDurationMinutes
slots[{ startAt, endAt, localStart, localEnd }]
```

Requirements:

- request and response schemas are runtime validated;
- venue/resource/offering relationships are resolved server-side;
- authorization and venue scope are checked before protected reads;
- foreign or cross-tenant identifiers return non-enumerating errors;
- stable errors distinguish invalid schedule, no effective schedule,
  incompatible offering/resource, and permission denial;
- OpenAPI and generated TypeScript client change together;
- no idempotency record or outbox event is added for this configuration create.

## UI requirements

Add `/setup/schedule` using shared shadcn/Base UI primitives.

The minimum workflow:

1. preserves the existing explicit business/venue context seam;
2. loads resources, offerings, and existing schedule versions in parallel;
3. creates a venue or selected-resource schedule version;
4. supports weekly periods and closed/replacement date exceptions;
5. previews one compatible offering/resource/operational date;
6. displays schedule source, timezone, exact/local context, empty result,
   trailing-remainder meaning, and a visible “not live availability” notice;
7. preserves entered values on validation, permission, network, and server
   failure;
8. supports keyboard operation, associated labels/errors, non-color state
   meaning, visible focus, 44 px controls, and 320 CSS px layout.

Server route shells remain separate from the interactive client component.
Independent initial reads start together. No new frontend dependency is
authorized.

## Permission expectations

| Actor | Read/preview | Create version |
|---|---|---|
| Owner | Allowed in business/venue scope | Allowed |
| Manager | Allowed in assigned venue scope | Allowed |
| Booking Staff | Allowed where `resource.read` applies | Denied |
| Finance/Reports | Allowed where `resource.read` applies | Denied |
| Other tenant | Non-enumerating denial | Non-enumerating denial |
| Platform Administrator | No implied tenant access | No implied mutation |

## Required tests

### Domain/application

- valid daytime, adjacent, cross-midnight, and remainder slot generation;
- overlapping weekly or exception periods rejected;
- exception close/replace precedence;
- resource override and venue fallback;
- DST forward gap and backward fold vectors outside `Asia/Dhaka`;
- generated exact ranges are half-open, ordered, and non-overlapping;
- timezone/operational date remain explicit.

### PostgreSQL integration

- empty-to-head and repeated migration;
- RLS denies before tenant context;
- Owner and venue-scoped Manager create/read in scope;
- Booking Staff and Finance mutation denied;
- cross-tenant list/create/preview identifiers do not leak;
- composite keys reject cross-venue resources;
- effective version timeline has no overlaps;
- immutable child rows cannot be updated/deleted;
- audit records successful version creation;
- venue fallback/resource override/exception resolution is deterministic.

### API and contract

- create, list, preview, and empty preview success schemas;
- schedule validation and safe non-enumerating errors;
- permission denial;
- no-effective-schedule and incompatible-resource cases;
- OpenAPI regeneration and generated-client compilation.

### UI and accessibility

- parallel initial load and loading/empty/error/success states;
- keyboard schedule submission and preview;
- labels, descriptions, and error association;
- closed/replacement exception behavior;
- visible timezone/operational-date/source context;
- permission and validation recovery without erased input;
- narrow layout and touch targets;
- no claim that preview equals live availability.

## Completion gate

Run:

```sh
./scripts/pnpmw api:generate
./scripts/pnpmw ai:verify
./scripts/pnpmw db:migrate
./scripts/pnpmw db:seed
./scripts/pnpmw test:integration
./scripts/pnpmw build
./scripts/pnpmw ai:verify:full
```

Then prove:

1. V-01 generates valid 60-minute Turf 1 slots inside its schedule.
2. V-05 generates after-midnight slots that retain the opening operational
   date.
3. a non-Dhaka DST gap/fold vector is deterministic.
4. a resource override wins only for its resource/date; venue fallback remains
   unchanged elsewhere.
5. another tenant and Finance/Reports cannot mutate a schedule by calling the
   API directly.
6. the web consumes only the generated `/v1` client boundary.

## Stop conditions

Stop and ask before:

- adding price, policy, availability, capacity, booking, block, or public
  behavior;
- adding a dependency or changing fixed role meaning;
- weakening version immutability, RLS, composite tenant keys, audit, or API-only
  client access;
- choosing a different DST disambiguation or schedule-inheritance policy;
- editing an applied migration;
- committing, pushing, deploying, or deleting data.
