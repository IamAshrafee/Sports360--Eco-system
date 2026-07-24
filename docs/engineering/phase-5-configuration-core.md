# Phase 5 Configuration Core

Status: Implemented and verified

Last verified: 2026-07-24

## Outcome

P5-01 is the first implemented Phase 5 vertical slice. An authenticated Owner
or venue-scoped Manager can use the `/v1` API and the web setup experience to
manage tenant-owned activities, independent venue resources, and
fixed-duration offerings. PostgreSQL remains the final tenant, venue,
relationship, lifecycle, and permission boundary.

This is configuration only. It does not make an offering bookable because
schedules, slots, prices, policies, availability, customers, bookings,
payments, Today, reports, and public publication remain deferred.

## Implemented scope

### Persistence and domain

- Migrations `005_configuration_core.sql` and
  `006_configuration_invariant_hardening.sql` add activities, offerings,
  offering/resource compatibility, versions, indexes, grants, forced RLS, and
  deferred integrity checks.
- `resources.activity_id` is authoritative. The legacy `activity_code` column
  is retained and projected during the transition so existing seed meaning is
  not destroyed.
- Every Phase 5 resource creates exactly one physical resource unit. The API
  and UI do not expose arbitrary capacity.
- Active offerings require an active activity and at least one compatible
  active independent resource from the same business and venue.
- Activity/resource state changes recheck linked active offerings.
- Repository functions provide cursor lists, create/edit operations,
  optimistic versions, relationship validation, safe persistence errors, and
  an audit record for each successful mutation.
- V-01 deterministically represents Football → Turf 1 → 60-minute offering.
  V-03-style integration fixtures prove two sports, resources, and offerings in
  one venue.

### API and client

- `/v1/activities` exposes list, create, and edit.
- `/v1/venues/{venueId}/resources` exposes list, create, and edit.
- `/v1/venues/{venueId}/offerings` exposes list, create, detail, and edit.
- Better Auth session identity, `x-business-id`, fixed permissions, venue
  scope, transaction-local PostgreSQL context, runtime schemas, stable safe
  errors, and correlation IDs are enforced at the application boundary.
- Lists use deterministic UUIDv7 cursor pagination.
- Exact duplicate constraints prevent accidental duplicate configuration;
  configuration creation does not introduce idempotency retention complexity.
- OpenAPI and the generated TypeScript client include every route. The client
  is exported as compiled JavaScript and declarations, so consumers do not
  recompile generated transport code under a different TypeScript policy.

### Web experience

- `/setup` provides the configuration overview and explicit business/venue
  context seam.
- `/setup/resources` manages activities and independent resources.
- `/setup/offerings` creates and manages compatible fixed-duration offerings.
- The workflow uses shared shadcn/Base UI-aligned primitives and semantic
  tokens, parallel API reads, cancellable initial loads, server route shells,
  and client components only where interaction is required.
- Loading, empty, error, success, permission-denial, and stale-edit recovery
  states are covered. Labels, descriptions, keyboard submission, non-color
  status meaning, and 44 px interactive controls are preserved at 320 CSS px.

## Important decisions

- Activity codes are stable tenant-owned identifiers and are immutable after
  creation in this slice. Display names and lifecycle state remain editable.
- Fixed duration is constrained to `1..1440` minutes as a technical integrity
  bound, not as a future commercial policy.
- Migrations `005` and `006` are both immutable history. Hardening discovered
  after applying `005` was delivered forward in `006`.
- Retire `resources.activity_code` only after all readers use `activity_id`,
  production backfill evidence is inspected, and a separate forward migration
  is reviewed.
- URL query context is a temporary authenticated-navigation seam. It avoids
  hard-coded demo identifiers; a business/venue selector belongs to a later
  onboarding/navigation slice.
- React performance guidance influenced parallel configuration reads,
  minimal client serialization, and the server-shell/client-interaction split.

## Verification

The following fresh gate passed under Node `24.18.0` and pnpm `11.17.0` with
healthy local PostgreSQL `18.4` and Valkey `9.1` services:

```sh
./scripts/pnpmw ai:verify:full
```

It proved:

- OpenAPI regeneration and generated-client compilation;
- runtime, ESLint, TypeScript, unit/component/API tests, and formatting;
- repeated migration with the database already current;
- deterministic reseeding;
- auth and queue integration tests;
- 21 PostgreSQL security/configuration tests across two suites, including
  empty-to-head and repeated migrations, deny-before-context, Owner/Manager
  allowance, Booking/Finance denial, venue scope, cross-tenant isolation,
  composite relationship enforcement, audit, stale versions, and active
  offering invariants;
- production builds for the web, API, worker, and all shared packages.

An actual browser smoke check at 320 × 800 CSS px confirmed no horizontal page
overflow and 44 px setup links, inputs, and primary action.

## Known limitations

- The setup API requires an authenticated session and explicit business
  context. The current setup overview accepts opaque business and venue IDs
  until authenticated navigation owns that selection.
- The UI exposes the minimum create/list/lifecycle workflow; richer edit
  dialogs and onboarding polish are not part of P5-01.
- Provider availability, deployment, and Dhaka-region production performance
  remain unverified and were not required for this local slice.

## Next dependency-safe slice

Implement P5-02 Schedule and Fixed Slots. It may depend on activities,
resources, offerings, fixed duration, versions, audit, and tenant/venue
boundaries proven here. It must not introduce pricing, availability, booking,
payments, or public publication.
