# Decision Log

This log records approved product decisions. A later reversal should create a
new decision that supersedes the old one rather than silently editing history.

## Decisions

| ID | Date | Decision | Rationale |
|---|---|---|---|
| D-001 | 2026-07-24 | Launch for Bangladesh first while keeping architecture international-ready. | Concrete local defaults and workflows create a sharper initial product. |
| D-002 | 2026-07-24 | Position the product as B2B venue management SaaS, not only a booking marketplace. | Venue operations and owner control are the durable primary value. |
| D-003 | 2026-07-24 | Venue businesses are the initial paying customers. | Owners capture the operational and financial value. |
| D-004 | 2026-07-24 | Begin with small-to-medium private venues, usually one location and 2–10 resources. | Strong pain and fast decisions without enterprise complexity. |
| D-005 | 2026-07-24 | Support online, phone, message, and walk-in bookings in one calendar. | Local operations will remain multi-channel. |
| D-006 | 2026-07-24 | Use one global identity with tenant-local memberships and customer relationships. | A person may be owner, employee, customer, and team member in different contexts. |
| D-007 | 2026-07-24 | Begin with fixed Business Owner, Manager, Booking Staff, and Finance/Reports profiles. | Understandable access without premature custom-role complexity. |
| D-008 | 2026-07-24 | Keep venue scope separate from role. | Avoid branch-specific role proliferation. |
| D-009 | 2026-07-24 | Model Business → Venue → Resource → Offering → Booking. | Separates physical spaces from the activities and terms sold. |
| D-010 | 2026-07-24 | Treat activities, amenities, add-ons, and resources as distinct concepts. | They affect booking, availability, and pricing differently. |
| D-011 | 2026-07-24 | Generate availability from schedules, reservations, holds, and blocks. | Avoid permanently materializing unnecessary slot records. |
| D-012 | 2026-07-24 | Private pilot supports fixed slots and independent resources. | Proves the core engine before flexible/composite complexity. |
| D-013 | 2026-07-24 | Separate booking, payment, and attendance state. | Valid real-world combinations cannot be represented by one status. |
| D-014 | 2026-07-24 | Enforce conflicts on server/database using half-open time intervals. | Prevent double booking and allow back-to-back reservations. |
| D-015 | 2026-07-24 | Snapshot booking price, commercial terms, and important contact data. | Historical records must remain understandable after configuration changes. |
| D-016 | 2026-07-24 | Allow no advance, fixed advance, percentage advance, and full-payment policies. | Venues use different confirmation practices. |
| D-017 | 2026-07-24 | Store multiple exact payment/refund transactions, not a paid flag. | Supports advance, partial collection, due, refund, and reconciliation. |
| D-018 | 2026-07-24 | Start with subscription SaaS and venue-owned booking revenue. | Avoid premature platform payout and regulatory/settlement complexity. |
| D-019 | 2026-07-24 | Guest booking is allowed; registration is optional. | Phone, message, and walk-in operations must remain fast. |
| D-020 | 2026-07-24 | Each business sees only its private customer relationship. | Protect tenant privacy and avoid cross-business reputation problems. |
| D-021 | 2026-07-24 | Team booking requires one contact, not all participant registrations. | Keeps booking straightforward while preserving future team capability. |
| D-022 | 2026-07-24 | Make Today the primary staff operations workspace. | Daily work should not require navigation through an ERP-like interface. |
| D-023 | 2026-07-24 | Require connectivity for confirmed booking; defer full offline writes. | Offline conflict merging risks double booking. |
| D-024 | 2026-07-24 | Every report metric has a date basis, formula, and drill-down. | Owner trust depends on traceability and consistent definitions. |
| D-025 | 2026-07-24 | Describe early profit-like reporting as estimated operational result. | The MVP is not audited accounting software. |
| D-026 | 2026-07-24 | Start with assisted pilot onboarding and manual subscription collection. | Maximizes learning before automating an unvalidated sales process. |
| D-027 | 2026-07-24 | Centralize plan entitlements and preserve data through limits/downgrades. | Plans can evolve without destructive or scattered logic. |
| D-028 | 2026-07-24 | Pilot one active venue per business while keeping a multi-venue model. | Reduces pilot complexity without creating a schema dead end. |
| D-029 | 2026-07-24 | Build staff source-of-truth operations before marketplace discovery. | Public availability is only trustworthy after venue operations are centralized. |
| D-030 | 2026-07-24 | Use a staged rollout: simulation, one design partner, alpha venues, private beta, commercial v1. | Superseded by D-033 and D-034 because the active roadmap cannot depend on recruited external participants. |
| D-031 | 2026-07-24 | Separate future-product knowledge from current release scope using horizons and capability briefs. | Future direction needs enough definition to preserve architecture without silently expanding the MVP. |
| D-032 | 2026-07-24 | Specify every strategic future capability at direction and capability-brief level, but defer delivery specifications until validated. | Avoid both architectural blindness and speculative implementation detail. |
| D-033 | 2026-07-24 | Do not require direct venue-owner/staff interviews, outreach, or a recruited design partner in the active roadmap. | The project is led by one developer without a team, company identity, or reliable industry network; the plan must be executable under that constraint. |
| D-034 | 2026-07-24 | Replace mandatory external discovery with public desk research, competitor-flow analysis, structured venue simulations, test data, and later organic usage evidence. | Preserves disciplined learning without blocking development on founder-led sales or interviews. |
| D-035 | 2026-07-24 | Keep externally unverified market assumptions explicitly unvalidated. | Simulation and desk research improve design confidence but do not prove real customer behavior or willingness to pay. |
| D-036 | 2026-07-24 | Build a TypeScript modular monolith deployed as separate web, API, and worker process types. | Preserves strong transactions and solo-developer operability while allowing independent horizontal scaling and later service extraction. |
| D-037 | 2026-07-24 | Make versioned HTTP application contracts the only client-facing path to business capabilities. | The web MVP must be followed safely by mobile, additional websites, embeds, and integrations without coupling clients to UI or database code. |
| D-038 | 2026-07-24 | Use strict TypeScript, production Node.js LTS, Next.js for web, and Fastify for the dedicated API. | Matches founder expertise while creating a modern, supported, high-performance web/API foundation. |
| D-039 | 2026-07-24 | Use a PostgreSQL-specific transactional core with shared-schema tenancy and defense-in-depth RLS. | PostgreSQL ranges, exclusion constraints, exact types, transactions, and row security directly support booking correctness and tenant isolation. |
| D-040 | 2026-07-24 | Enforce active resource capacity in PostgreSQL and serialize related resource/block mutations per resource. | Prevents double booking across replicas while allowing urgent blocks to overlap and explicitly resolve existing bookings. |
| D-041 | 2026-07-24 | Begin with lean managed and portable infrastructure rather than AWS-first deployment. | There is no known budget or revenue evidence; containers and standard managed services preserve reliability and a future provider migration path. |
| D-042 | 2026-07-24 | Treat mobile and public integrations as post-MVP architecture requirements, while shipping web only initially. | The API, identity, versioning, idempotency, scopes, and webhooks must be designed before external clients arrive, without expanding the MVP delivery surface. |
| D-043 | 2026-07-24 | Use Kysely with node-postgres and ordered reviewed SQL migrations. | The system needs typed ordinary queries while keeping PostgreSQL-specific constraints, RLS, and schema authority fully visible. |
| D-044 | 2026-07-24 | Use Better Auth for self-hosted session mechanics while the application owns authorization and OTP delivery remains adapter-based. | This avoids building credential/session security from scratch without coupling tenant membership and venue permissions to an auth library. |
| D-045 | 2026-07-24 | Select DigitalOcean Bangalore provisionally for production, with Render Singapore as fallback and mandatory latency, restore, compatibility, and cost gates. | It offers a lean managed web/API/worker/data footprint near Bangladesh while keeping a practical provider exit. |
| D-046 | 2026-07-24 | Use BullMQ over managed Valkey, database outbox/due-time recovery, `sms.bd` as first SMS candidate, and Resend as first email candidate. | Delayed/retryable work needs strong worker tooling, while delivery providers must remain replaceable and unable to corrupt booking truth. |
| D-047 | 2026-07-24 | Use OpenTelemetry and structured logs with Better Stack as the initial telemetry, uptime, and heartbeat backend. | One solo-friendly console meets early observability needs while OTLP preserves an exit path. |
| D-048 | 2026-07-24 | Use a pnpm workspace without an initial build orchestrator. | One repository supports atomic contracts and shared packages; extra caching/orchestration should follow measured build pain. |
| D-049 | 2026-07-24 | Use shadcn/ui on Base UI as the first-party web design-system foundation, with owned source in the shared UI workspace. | It matches founder preference, accelerates consistent accessible interfaces, and avoids competing component-library abstractions. |

## Decision template

```text
ID:
Date:
Status:
Context:
Decision:
Alternatives:
Consequences:
Documents affected:
Supersedes:
```
