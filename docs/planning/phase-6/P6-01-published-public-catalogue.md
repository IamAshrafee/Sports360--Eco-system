# P6-01 Published Public Catalogue

Status: Implementation-ready task brief; blocked until Phase 5 exit

Phase: 6 — Customer booking and pilot SaaS

## Outcome

A customer can open one venue's platform-hosted public page and view only its
explicitly published venue details, offerings, policy summary, dates, prices,
and current fixed-slot availability. No checkout or capacity hold exists yet.

## Traceability

- Workflow: `WF-CFG-002`
- Stories: `US-CFG-008`, `US-PUB-001`
- Acceptance: `AC-CFG-009`, `AC-CFG-010`, `AC-BKG-004`,
  `AC-NFR-005`, `AC-NFR-011`, `AC-NFR-012`
- Threats: `THR-001`, `THR-011`–`013`, `THR-018`, `THR-025`–`027`
- Screens: public venue home, activity/offering, date, availability
- Fixtures: V-01 and V-03

## Preconditions

- Phase 5 integrated gate passes.
- Venue, offering, schedule, price, policy, block, and availability sources are
  authoritative.
- Staff configuration retains version/effective history.
- The canonical API base path remains `/v1`.

## In scope

- publication-readiness query and explicit published revision/projection;
- owner preview and publish/unpublish command if not completed earlier;
- public venue page by stable public slug;
- public activity/offering/date/availability reads;
- minimal customer-safe price/policy/contact display;
- response/cache/version semantics and public rate limits;
- mobile, loading, empty, unavailable, stale, and error states;
- OpenAPI/generated client and public contract/security tests.

## Out of scope

- checkout session or hold;
- customer name/phone input or OTP;
- booking/payment creation;
- secure booking links;
- notifications;
- public discovery across businesses;
- custom domains, embeds, partner API, reviews, maps, media uploads, or SEO
  expansion beyond required page metadata.

## Publication model

Publishing must snapshot/reference the exact public configuration revision.
Readiness requires:

```text
public contact
active venue
at least one active published offering
compatible active independent resource
effective schedule/fixed slots
deterministic price
active policy summary/cancellation terms
subscription entitlement permitting publication
```

Rules:

- incomplete readiness returns actionable owner-only failures;
- preview may read draft projection only for an authorized owner/manager;
- public reads use only published fields;
- unpublish prevents new public selection while existing staff operations and
  customer secure links remain intact;
- later resource/configuration changes remove invalid future availability
  without rewriting old bookings.

## Public contract

Candidate routes:

```text
GET /v1/public/venues/{publicSlug}
GET /v1/public/venues/{publicSlug}/offerings
GET /v1/public/venues/{publicSlug}/availability?offeringId=&from=&to=
```

Contract requirements:

- no staff session is required;
- public IDs/slugs do not authorize private routes;
- only allow-listed fields and filters are returned;
- availability includes exact instants plus venue-local display context;
- money uses integer minor units and currency;
- policy response is a safe customer summary, not internal configuration;
- cache/version metadata makes freshness clear;
- unknown/unpublished slugs are non-enumerating where practical;
- pagination/date range and request complexity are bounded.

## UI requirements

- mobile-first from 320 CSS px;
- useful venue/offering content before optional client JavaScript;
- activity/offering/date choice and fixed slots;
- price and cancellation/advance summary visible before any future checkout;
- unavailable/stale state cannot look selectable;
- keyboard and screen-reader navigation for dates/slots;
- no status conveyed only by color;
- loading layout does not hide prolonged failure;
- user-facing copy remains externalizable for Bangla.

Use `$vercel-react-best-practices` for material React/Next.js work, but do not
add SWR, Vercel services, caching libraries, or unpinned packages without
project review.

## Security and performance

- public data access cannot establish tenant database context from a
  client-supplied `business_id`;
- use a controlled published-read path that cannot query private tenant tables
  arbitrarily;
- apply public rate, range, and complexity limits;
- do not expose phone numbers beyond explicitly published business contact;
- exclude internal notes, customer/staff/payment/audit/subscription details;
- stale cache may cause a later safe conflict, never a false commit;
- target useful public content within the documented mobile performance budget.

## Tests

- incomplete venue cannot publish;
- valid venue preview differs from public visibility until explicit publish;
- public response contains exactly the allow-listed projection;
- unpublish removes public catalogue/availability;
- cross-business slug/ID manipulation cannot reveal draft/private fields;
- price, timezone, operational-date, schedule exception, claim, and block
  effects appear correctly in availability;
- input range/filters and rate limits are bounded;
- API/OpenAPI/client compile and schema tests;
- 320px, keyboard, focus, screen-reader naming, slow/error/stale UI tests;
- no checkout, hold, customer, payment, audit, or outbox side effect from reads.

## Completion gate

Run the full contract, PostgreSQL, integration, web, accessibility, and build
gate required by `docs/ai/definition-of-done.md`.

Demonstrate:

1. V-01 publishes one football offering and correct fixed availability.
2. V-03 publishes multiple activities without sport-specific code.
3. draft/internal fields never appear publicly.
4. a block/claim removes only the affected public slot/resource.
5. selecting/viewing a slot still creates no hold or booking.

## Human assignment prompt

```text
Use $sports-saas-engineering and implement P6-01 from
docs/planning/phase-6/P6-01-published-public-catalogue.md.

First prove the Phase 5 exit gate. Build only published public catalogue and
read-only availability. Keep checkout, holds, OTP, customers, payments, secure
booking links, notifications, subscriptions, marketplace, and integrations out
of scope.

Use $vercel-react-best-practices for material React/Next.js work and
$systematic-debugging for any existing failure before proposing a fix.

Do not add dependencies, commit, push, deploy, purchase providers, contact
external people, or perform destructive actions without explicit approval.
Finish with the task completion gate and update current-state and handoff.
```
