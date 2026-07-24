# ADR-002: API-First Contracts for Multiple Clients

Status: Accepted
Date: 2026-07-24

## Context

The initial client is a responsive web application. Soon after the MVP, the
product may add native/mobile clients, widgets, customer-website integrations,
and a public partner API.

## Decision

All client-visible business capabilities enter through versioned HTTP
application contracts rather than direct UI-to-database access.

- The first-party web and future mobile clients use the first-party API.
- External customer websites and partners use a deliberately scoped partner
  API, embeds/widgets, and webhooks.
- Both delivery surfaces invoke the same application use cases.
- REST/JSON and OpenAPI are the initial contract style.
- TypeScript clients are generated from the contract.
- Mutations that can be retried accept idempotency keys.
- Breaking external changes require a new API version and migration window.

## Important boundary

The first-party API is not automatically public. Internal screens may require
fine-grained commands or information that must never become a partner contract.
The public API has separate authentication, scopes, quotas, documentation,
privacy review, and lifecycle guarantees.

## Rejected alternatives

- UI-bound server actions as the only backend interface.
- Direct database access for customer integrations.
- Exposing the full internal API and attempting to secure it afterward.
- GraphQL as the default before client query needs justify its complexity.

## Consequences

- Initial work includes OpenAPI schemas, consistent errors, pagination,
  correlation IDs, and contract tests.
- Mobile development later reuses domain behavior without scraping web logic.
- Website integrations can choose hosted booking link, embed/widget, or scoped
  API according to complexity.
- Public API/webhooks become product capabilities with explicit entitlements.

## Traceability

US-PUB-001–006; NFR-REL-003; NFR-SEC-001–007; future marketplace and platform
integration briefs.
