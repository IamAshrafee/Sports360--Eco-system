# Phase 5 Schedule and Fixed Slots

Status: Implemented and verified

Last verified: 2026-07-24

## Outcome

P5-02 is the second implemented Phase 5 vertical slice. An authenticated Owner
or authorized venue-scoped Manager can define immutable, effective-dated venue
or resource schedules and preview fixed internal slots for a compatible
offering, resource, and operational date.

The preview is deliberately not live availability. It does not inspect
bookings, capacity claims, blocks, prices, policies, or payments.

## Implemented scope

### Schedule model and time rules

- Migration `007_schedule_and_fixed_slots.sql` adds schedule versions, weekly
  periods, specific-date exceptions, replacement periods, effective-range
  exclusion constraints, immutable-content enforcement, audit, grants, and
  forced RLS.
- Every schedule row retains `business_id`; composite foreign keys keep venue,
  resource, and child records in one tenant and venue.
- Venue schedules are the default. An effective resource schedule fully
  overrides the venue schedule for that resource and operational date.
- Weekly and exception periods are half-open and may cross midnight while
  retaining the opening operational date.
- `CLOSED` exceptions remove all periods for a date. `REPLACE` exceptions
  replace rather than merge with the recurring weekday periods.
- Pure domain logic resolves IANA timezone boundaries and partitions each
  effective period by the offering's fixed duration. A short trailing
  remainder is discarded rather than exposed as a partial slot.
- Nonexistent DST boundaries are rejected. Repeated opening boundaries select
  the earlier instant and repeated closing boundaries select the later
  instant, preserving exact elapsed slot duration.

### API and client

- `GET /v1/venues/{venueId}/schedules` lists immutable schedule versions and
  may filter by resource.
- `POST /v1/venues/{venueId}/schedules` inserts a new effective version without
  rewriting earlier schedule content.
- `GET /v1/venues/{venueId}/slot-preview` resolves compatible
  offering/resource input, effective resource override or venue fallback,
  timezone, operational date, and exact/local slot output.
- Application authorization checks membership, permission, and venue scope
  before protected persistence work. PostgreSQL repeats the tenant,
  permission, and venue-scope boundary.
- Runtime schemas, OpenAPI, and the independently compiled generated client
  changed together.

### Web experience

- `/setup/schedule` adds schedule creation, weekly split periods,
  closed/replacement date exceptions, version history, and fixed-slot preview
  to the existing shadcn/Base UI setup shell.
- Initial resources, offerings, and schedule versions load in parallel.
- The workflow displays schedule source, IANA timezone, operational date, exact
  and local boundaries, and an explicit warning that preview is not
  availability.
- Form values remain available after validation, authorization, network, or
  server failure. Loading, empty, error, success, and recovery states are
  covered.
- Native links replace polymorphic Button-as-Link usage on the affected home
  and setup navigation surfaces, removing the Base UI native-button warning
  while retaining shared button variants.

## Important decisions

- Schedule versions are immutable domain records. Corrections create a later
  effective version; only timeline closure metadata changes.
- Effective dates are local operational dates. PostgreSQL returns them as
  date text so JavaScript host timezone conversion cannot shift the day.
- Venue and resource schedules are complete definitions, not additive layers.
- Fixed slots use exact elapsed minutes after timezone-boundary conversion.
- No calendar or timezone dependency was added; the bounded converter uses the
  platform `Intl` implementation and is covered by non-Dhaka DST vectors.
- Schedule creation does not add idempotency retention or an outbox event
  because it is a configuration mutation with database uniqueness and no
  outbound effect.
- Money, price resolution, availability, capacity, bookings, blocks, and
  public publication remain outside P5-02.

## Verification

Fresh verification passed under Node `24.18.0` and pnpm `11.17.0` with healthy
local PostgreSQL and Valkey:

```sh
./scripts/pnpmw ai:verify
./scripts/pnpmw ai:verify:full
```

The evidence includes:

- runtime, ESLint, workspace TypeScript, formatting, and production builds;
- 17 domain tests, including daytime, adjacency, cross-midnight, remainder,
  exception precedence, and DST gap/fold behavior;
- 11 API/service tests covering the schedule routes and safe errors;
- 11 web component/page tests covering creation, replacement exceptions,
  preview, accessibility, and preserved-input recovery;
- 30 PostgreSQL integration tests across the migration/security,
  configuration, and schedule suites, including RLS, Owner and Manager scope,
  denied mutations, cross-tenant isolation, immutable content, audit,
  effective timelines, fallback, override, and exception resolution;
- repeated migration, deterministic seed, OpenAPI/client regeneration, and
  generated-client compilation.

A live browser smoke check verified the settled route at 1440 × 900 and
320 × 800 CSS px: there was no horizontal overflow or browser warning, the
setup navigation remained available, and primary form controls measured
44 px. The local OTP provider is disabled, so this smoke check exercised the
real unauthenticated recovery state. Authenticated success behavior is proven
by component, API, and PostgreSQL tests rather than claimed as live-browser
evidence.

## Known limitations

- The setup workflow still accepts opaque business and venue query context;
  authenticated navigation does not yet provide a first-class selector.
- Slot preview is schedule-only. It must not be used as evidence that a slot is
  free, priced, policy-compliant, or bookable.
- Production deployment, provider behavior, timezone-data drift across
  runtimes, and measured Dhaka-region performance remain unverified.

## Next dependency-safe slice

Implement P5-03 Price, Policy, and Add-ons. It may consume P5-01 offerings and
P5-02 slot context, but it must not introduce live availability, capacity
claims, bookings, payments, or public checkout.
