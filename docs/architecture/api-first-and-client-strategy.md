# API-First and Multi-Client Strategy

Status: Accepted architecture direction

## Product intent

The MVP ships a responsive web client. The architecture must support, soon
after MVP:

- a native or cross-platform mobile application;
- another first-party website;
- booking embedded into a venue’s existing website;
- selected third-party integrations;
- a public partner API and webhooks.

This requirement affects contracts, identity, versioning, authorization, and
observability from the beginning, even though the public API is not an MVP
deliverable.

## Delivery surfaces

| Surface | Consumer | Authentication | Contract expectation |
|---|---|---|---|
| First-party API | Web and future mobile apps | User session/access token with business context | Evolves with clients but remains versioned and contract-tested |
| Public booking API | Unauthenticated/verified customer flows | Secure checkout/booking tokens and OTP context | Strict minimal exposure, abuse controls, no staff data |
| Partner API | Venue-owned websites and approved integrations | OAuth/client credentials or scoped API keys, according to integration | Stable published version, scopes, quotas, deprecation policy |
| Webhooks | Venue/partner endpoints | Signed payload and replay protection | At-least-once delivery, event IDs, ordered only where explicitly stated |
| Hosted booking UI | Venue customers | Public/OTP flow | Lowest integration effort; full product-controlled UX |
| Embeddable widget | Venue websites | Public configuration/bootstrap token | Sandboxed/CORS-aware, delegates protected mutations to public booking API |

## Contract architecture

```text
Web / Mobile ───────────────► First-party HTTP adapter ─┐
                                                       │
Venue website / Partner ────► Partner HTTP adapter ────┼─► Application use cases
                                                       │
Public booking / Widget ────► Public HTTP adapter ─────┘

Application use cases ─► Domain modules ─► PostgreSQL / Outbox
```

HTTP adapters may expose different shapes and permissions while reusing the
same commands and queries. No adapter directly owns booking rules.

## Initial HTTP conventions

- Base path: `/v1`, matching the executable Phase 4 OpenAPI boundary.
- JSON request/response with explicit media/content types.
- OpenAPI is generated or verified from runtime schemas.
- Every response has a correlation/request ID.
- Resource IDs are opaque and non-enumerating; customer secure tokens are
  separate from staff identifiers.
- Timestamps use RFC 3339/ISO 8601 instants; venue-local display context is
  returned explicitly where required.
- BDT amounts use integer minor units plus currency, never JavaScript floats.
- Collection endpoints use cursor pagination when growth can be unbounded.
- Filter and sort fields are allow-listed.
- Errors use stable machine codes plus safe human messages and field details.
- Retriable mutations accept `Idempotency-Key`; reuse with a changed request
  hash is rejected.
- Optimistic concurrency/version fields are used where stale edits matter.

## Example error envelope

```json
{
  "error": {
    "code": "BOOKING_SLOT_CONFLICT",
    "message": "This time is no longer available.",
    "requestId": "req_...",
    "details": {
      "safeNextAction": "refresh_availability"
    }
  }
}
```

It never includes stack traces, database constraints, another tenant’s
identifier, or sensitive payment/contact content.

## Versioning

1. `/v1` marks the major contract family.
2. Additive optional fields do not require a new major.
3. Removing/renaming fields or changing meaning requires a new major for
   partner/public clients.
4. First-party clients still receive contract compatibility tests because
   mobile releases may remain installed after the backend changes.
5. Partner deprecation includes documented replacement, usage visibility, and
   a migration window.
6. Domain events and webhook schemas carry independent event schema versions.

## Authentication and authorization

- Authentication proves a caller/client identity.
- Business membership, profile, venue scope, and action permission authorize a
  first-party request.
- Partner credentials belong to one business/integration installation and have
  explicit scopes and venue access.
- Customer tokens grant only the named public booking capability.
- Public/partner API quotas cannot be bypassed by rotating resource IDs.
- Credential secrets are hashed/encrypted as appropriate and never retrievable
  after creation.
- Revocation is effective without deleting audit or historical records.

## Partner API scopes — future seam

Possible scopes are designed now but delivered later:

```text
venue:read
availability:read
booking:read
booking:create
booking:cancel
customer:read_limited
webhook:manage
```

Payment, customer export, refund, staff, subscription, and audit scopes are not
granted merely because booking creation is allowed.

## Webhook contract — future seam

Candidate events:

```text
booking.created
booking.confirmed
booking.rescheduled
booking.cancelled
payment.verified
payment.refunded
resource.blocked
```

Every delivery includes an event ID, type, schema version, occurred-at instant,
business-scoped subject, and signature. Receivers deduplicate by event ID.
Retries use backoff; delivery order is not promised unless a later contract
provides an aggregate sequence.

## Performance implications

- API and database are co-located; mobile/web latency is dominated by one
  regional network round trip plus a bounded transaction.
- Web rendering may call internal API paths over a private network, but it does
  not bypass domain/application behavior.
- Public published content can use CDN caching.
- Live capacity is refreshed and revalidated at commit.
- Responses avoid enormous nested graphs; clients request focused resources.
- Batch endpoints are added for proven client round-trip problems, not generic
  arbitrary execution.

## Testing obligations

- OpenAPI schema validation in CI.
- Generated-client compile tests.
- Consumer contract tests for web and later mobile.
- Backward-compatibility diff for partner/public contracts.
- Authorization tests per endpoint and scope.
- Idempotency/retry/concurrency tests for mutations.
- CORS, CSRF, token leakage, replay, rate-limit, and webhook-signature tests.
- Mobile stale-client tests before a native release.

## Explicitly deferred

- Shipping the partner API before the staff/public source of truth is stable.
- GraphQL federation.
- Arbitrary third-party plugins executing inside the application.
- Customer-provided code or database queries.
- Guaranteed cross-event global ordering.
