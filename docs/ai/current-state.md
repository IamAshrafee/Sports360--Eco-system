# Current Project State

Status: Active checkpoint

Last reviewed: 2026-07-24

## Delivery position

| Phase | State | Evidence |
|---|---|---|
| 0 — Product foundation | Complete | Product knowledge base |
| 1 — Solo-founder evidence and scenarios | Complete | Research and simulation documents |
| 2 — Detailed product specification | Complete | Specification catalogue and acceptance criteria |
| 3 — Domain, data, and architecture | Complete | Architecture hub, ADRs, and gate review |
| 4 — Engineering foundation | Complete | `docs/engineering/phase-4-foundation.md` |
| 5 — Staff-side booking core | Implementation active | P5-01 configuration core and P5-02 schedules/fixed slots are implemented and verified; P5-03 is next |
| 6 — Customer booking and pilot SaaS | Planned; gated | Delivery plan and P6-01 task brief; blocked until Phase 5 exits |
| 7 — Founder-operated simulated pilot | Planned; gated | Delivery plan and P7-01 task brief; blocked until Phase 6 exits |
| 8 — Organic beta and commercial evidence | Planned; gated | Delivery plan and P8-01 task brief; blocked until Phase 7 exits |
| H1+ — Future product horizons | Deferred | Future-capability briefs; promotion requires evidence and a new roadmap decision |

Phase 4 created the executable foundation. It does not mean booking,
customers, payments, scheduling, Today operations, or reporting are already
implemented.

## Repository checkpoint

- Branch when reviewed: `main`
- Current committed checkpoint: `86df1fb Project start scripts created`
- Phase 4 checkpoint: `716c410 Phase 4: Engineering foundation`
- Relationship at the start of P5-02 implementation: local `main` matched
  `origin/main`
- The AI collaboration foundation and `docs/others/` are tracked.
- P5-01 and the macOS development launchers are committed.
- P5-02 application and documentation changes are currently uncommitted after
  `86df1fb`.

Git facts are time-sensitive. Run `./scripts/pnpmw ai:context` before relying
on this section. Preserve `docs/others/` unless the user puts it in scope.

## Approved next outcome

P5-01 and P5-02 now provide:

- tenant-owned activities;
- one-unit independent venue resources;
- fixed-duration offerings with compatible resources;
- Owner/venue-scoped Manager configuration APIs and setup screens;
- PostgreSQL RLS, tenant/venue constraints, optimistic versions, audit, and
  active-offering invariants;
- regenerated OpenAPI and a compiled TypeScript client boundary.
- immutable effective-dated venue/resource schedule versions;
- weekly operating periods and closed/replacement date exceptions;
- IANA-timezone, operational-date, cross-midnight, and DST-safe fixed-slot
  generation;
- schedule list/create and schedule-only slot-preview APIs;
- a responsive shadcn/Base UI setup workflow with explicit non-availability
  meaning;
- PostgreSQL effective-range, tenant, venue, permission, immutability, and
  audit enforcement.

The verified implementation records are
`docs/engineering/phase-5-configuration-core.md` and
`docs/engineering/phase-5-schedule-and-fixed-slots.md`.

The next dependency-safe outcome is P5-03 Price, Policy, and Add-ons. First
turn the detailed P5-03 gate in `docs/planning/phase-5-delivery-plan.md` into a
bounded task brief. Price resolution, effective policies, and non-capacity
add-ons may consume P5-01 offering and P5-02 slot context. Live availability,
capacity claims, bookings, customers, payments, Today, reports, and public
booking remain later slices.

The complete phase-control map is
`docs/planning/all-phase-delivery-index.md`. Phases 6–8 now have gated master
plans and first task briefs, but they are not active and must not be started
before their preceding exit gates pass.

## Known boundaries

- Web is the only initial client, but mobile and public integration APIs are
  near-term architecture consumers.
- The active roadmap cannot depend on interviews, owner/staff outreach, or a
  recruited design partner.
- Bangladesh-specific defaults are permitted; country assumptions must not be
  embedded in core domain types.
- Public booking belongs to Phase 6. Phase 5 is staff-side operations.
- Every local human/agent project command uses `./scripts/pnpmw`; direct pnpm
  remains valid in CI only after the workflow installs the declared runtime.
- Production providers, deployment, and measured Dhaka-region performance
  remain unverified.
