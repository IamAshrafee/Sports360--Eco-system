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
