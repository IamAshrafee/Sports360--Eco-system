# P5-01 Configuration Core

Status: Implemented and verified

Phase: 5 — Staff-side booking core

Implementation evidence:
[Phase 5 configuration core](../../engineering/phase-5-configuration-core.md)

## Outcome

An authorized Business Owner or Manager can create and retrieve the activity,
independent resource, and offering configuration needed for internal booking,
while tenant, venue, compatibility, and permission boundaries are enforced by
the API and PostgreSQL.

## Traceability

- Workflow: `WF-CFG-001`
- Stories: `US-CFG-001`, `US-CFG-002`
- Acceptance: `AC-CFG-001`, `AC-CFG-002`, `AC-AUTH-002`,
  `AC-AUTH-006`, `AC-NFR-003`, `AC-NFR-012`
- Invariants: `INV-TEN-001`–`INV-TEN-005`, configuration aggregate rules,
  audit/version rules
- Screens: setup overview, business basics, venue basics, activities/resources,
  offerings
- Fixtures: V-01 Single Turf and V-03 Mixed-Sport Complex

`AC-CFG-001` is partly proven by the Phase 4 seed/foundation. This task extends
the persisted business/venue model only where internal configuration requires
it; it does not rebuild owner registration.

## In scope

- Reconcile API prefix documentation to the implemented `/v1` contract.
- Add tenant-owned activity configuration.
- Evolve independent resource configuration from its temporary activity-code
  seam without losing seeded meaning.
- Add offerings with one fixed duration and at least one compatible active
  independent resource.
- Add explicit offering/resource compatibility.
- Add list, detail, create, and edit commands/queries needed by setup.
- Use optimistic concurrency/version checks for edits.
- Add `/v1` runtime schemas and stable safe error codes.
- Regenerate OpenAPI and the TypeScript client.
- Add mobile-responsive setup UI for the minimum workflow.
- Add audit records for successful configuration changes.
- Add real PostgreSQL tenant, venue, foreign-key, permission, and migration
  tests.

## Out of scope

- operating hours, slot generation, schedule exceptions;
- price rules, policy versions, amenities, or add-ons;
- resource blocks or availability;
- staff booking/customer/payment records;
- public preview, publication, checkout, or OTP;
- multi-unit/composite/divisible-resource UI;
- custom activity marketplace taxonomy;
- dependency additions unless separately reviewed and approved.

## Required domain behavior

### Activity

Minimum fields:

```text
id
business_id
code or stable slug
display name
state: ACTIVE | INACTIVE
version
created_at / updated_at
```

The code is tenant-owned configuration, not a global authorization boundary.
Do not assume all venues use a fixed worldwide sport catalogue.

### Independent resource

Minimum behavior:

- belongs to exactly one business and venue;
- links to compatible activity configuration;
- is treated as one independent allocatable unit in the Phase 5 product;
- has Draft/Active/Inactive lifecycle sufficient for setup;
- cannot be moved across tenant/venue by an edit;
- future deactivation-with-bookings behavior remains reserved for the later
  lifecycle/block slice.

The existing generalized `resource_units` table may remain physical
infrastructure. The Phase 5 API/UI must not expose arbitrary capacity > 1 as a
new feature.

### Offering

Minimum fields/behavior:

```text
id
business_id
venue_id
activity_id
name
fixed duration in minutes
state: DRAFT | ACTIVE | INACTIVE
version
one-or-more compatible resource links
created_at / updated_at
```

Rules:

- every relationship is tenant and venue consistent;
- a publishable/active offering references at least one compatible active
  independent resource;
- fixed duration is positive and bounded;
- an edit cannot silently discard compatibility required by active future
  bookings—full future-booking enforcement enters its later slice;
- schedule, price, and policy absence means “not internally bookable yet,” not
  fabricated defaults.

## Persistence requirements

- Create migration `005_...sql`; never modify migrations `001`–`004`.
- Preserve composite tenant foreign keys.
- Enable and force RLS on every tenant-owned table.
- Grant only the runtime privileges needed by approved commands.
- Add access-pattern indexes for venue-scoped lists and stable lookups.
- Preserve existing V-01/V-02-style seeded resource meaning when replacing or
  supplementing `activity_code`.
- Prefer constraints for same-tenant/same-venue relationships.
- Do not create cascades that can erase historical configuration unexpectedly.
- Include migration idempotence/checksum behavior in existing migration tests.

The implementation plan must state how old `resources.activity_code` values
are migrated or projected and when the column can safely be retired.

## Application and API requirements

Use existing transaction-local authorization context. Minimum operations:

```text
GET    /v1/activities
POST   /v1/activities
PATCH  /v1/activities/{activityId}

GET    /v1/venues/{venueId}/resources
POST   /v1/venues/{venueId}/resources
PATCH  /v1/venues/{venueId}/resources/{resourceId}

GET    /v1/venues/{venueId}/offerings
POST   /v1/venues/{venueId}/offerings
GET    /v1/venues/{venueId}/offerings/{offeringId}
PATCH  /v1/venues/{venueId}/offerings/{offeringId}
```

Exact route grouping may change if the agent demonstrates a more consistent
existing convention, but it must remain `/v1`, resource-oriented, and suitable
for future mobile clients.

Requirements:

- request and response schemas are runtime validated;
- identifiers are opaque;
- lists have deterministic ordering and a growth-safe pagination decision;
- edits accept an expected version/`If-Match` strategy;
- authorization failures and missing cross-tenant IDs are non-enumerating;
- safe error codes distinguish validation, permission, stale edit, and
  incompatible relationship;
- successful mutations return the persisted result and correlation ID;
- OpenAPI and generated client compile in the same change.

Configuration creation should not add idempotency complexity merely by habit.
If create commands are safely retryable from mobile/web and can duplicate
records, use the existing idempotency foundation and document retention/key
scope. Otherwise provide a clear duplicate prevention strategy.

## UI requirements

Use `packages/ui` shadcn/Base UI primitives and semantic tokens. Minimum setup
experience:

1. Setup overview links to Activities & resources and Offerings.
2. Owner/Manager can see empty, loading, error, and populated states.
3. Activity/resource creation is understandable at 320 CSS px.
4. Offering form selects activity, fixed duration, and compatible resources.
5. Validation errors are associated with fields and summarized where useful.
6. Permission denial and stale-edit conflict have recovery actions.
7. Success is visible in page state; a toast is not the only evidence.
8. Booking/payment/attendance state components are not introduced in this
   slice.

Use `$vercel-react-best-practices` for material React/Next.js work, subject to
repository rules:

- do not add SWR, LRU, `better-all`, or another dependency automatically;
- do not run unpinned `npx` commands;
- prefer server-rendered markup until client interaction is required;
- avoid waterfalls and unnecessary client serialization.

## Permission expectations

| Actor | Read | Create/edit |
|---|---|---|
| Owner | Allowed in business/venue scope | Allowed |
| Manager | Allowed in assigned scope | Allowed where current fixed profile permits |
| Booking Staff | Resource read allowed | Denied |
| Finance/Reports | Resource read allowed | Denied |
| Other tenant | Non-enumerating denial | Non-enumerating denial |
| Platform Administrator | No implied ordinary tenant access | No implied ordinary tenant mutation |

If existing fixed profile permissions do not exactly match a screen action,
use the accepted permission codes and record the discrepancy; do not create
custom roles.

## Required tests

### Domain/application

- valid and invalid duration/state transitions;
- offering must retain a compatible resource;
- stale version edit rejected;
- tenant/venue relationship mismatch rejected before persistence effect.

### PostgreSQL integration

- migration empty-to-head and repeated migration;
- RLS denies before context;
- Owner/Manager allowed in scope;
- Finance/Booking Staff mutation denied;
- cross-tenant list/detail/mutation does not leak;
- composite FK prevents cross-business/cross-venue links;
- active offering cannot have zero compatible active resources according to
  the chosen transaction/constraint design;
- seeded activities/resources/offerings remain deterministic.

### API/contract

- success schemas and safe errors;
- non-enumerating foreign ID;
- optimistic-concurrency conflict;
- OpenAPI regeneration and generated-client compile.

### UI/accessibility

- keyboard form flow and visible focus;
- label, description, and error association;
- empty/loading/error/success states;
- 320px layout and touch targets;
- permission and stale-edit recovery;
- no color-only state meaning.

## Completion gate

Run:

```sh
./scripts/pnpmw api:generate
./scripts/pnpmw ai:verify
./scripts/pnpmw db:migrate
./scripts/pnpmw db:seed
./scripts/pnpmw test:integration
./scripts/pnpmw build
```

Then prove:

1. V-01 can represent Football → Turf 1 → 60-minute Football offering.
2. V-03 can represent at least two activities/resources/offerings in one venue.
3. another tenant cannot see or reference either fixture.
4. Finance/Reports cannot mutate configuration by calling the API directly.
5. the generated web client consumes the API rather than server internals.

## Human assignment prompt

```text
Use $sports-saas-engineering and implement P5-01 from
docs/planning/phase-5/P5-01-configuration-core.md.

Build only the activity, independent-resource, and offering configuration
vertical slice. Keep schedules, prices, policies, availability, bookings,
customers, payments, Today, reports, and public booking out of scope.

Start by reconciling the current schema and API contract with the brief. Use
$vercel-react-best-practices for the React/Next.js work. If any existing test
or behavior fails, use $systematic-debugging before proposing a fix.

You may edit scoped repository files and run local verification. Do not add
dependencies, commit, push, deploy, contact external people, or perform
destructive actions without explicit approval.

Finish with the completion gate, update docs/ai/current-state.md and
docs/ai/handoff.md, and separate implemented, verified, deferred, and
unverified results.
```

## Stop conditions

Stop and ask the human before:

- choosing a product behavior not resolved by the cited sources;
- introducing a dependency or provider;
- changing fixed role meaning;
- weakening RLS, tenant composite keys, audit, or API-only client access;
- expanding into public publication or booking;
- editing an applied migration;
- performing a destructive data rewrite without an explicit reviewed
  migration/backfill plan.
