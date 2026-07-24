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
| 5 — Staff-side booking core | Planning active | Delivery plan and P5-01 task brief; implementation not started |
| 6 — Customer booking and pilot SaaS | Planned; gated | Delivery plan and P6-01 task brief; blocked until Phase 5 exits |
| 7 — Founder-operated simulated pilot | Planned; gated | Delivery plan and P7-01 task brief; blocked until Phase 6 exits |
| 8 — Organic beta and commercial evidence | Planned; gated | Delivery plan and P8-01 task brief; blocked until Phase 7 exits |
| H1+ — Future product horizons | Deferred | Future-capability briefs; promotion requires evidence and a new roadmap decision |

Phase 4 created the executable foundation. It does not mean booking,
customers, payments, scheduling, Today operations, or reporting are already
implemented.

## Repository checkpoint

- Branch when reviewed: `main`
- Current committed checkpoint: `609a807 Agent workflow done`
- Phase 4 checkpoint: `716c410 Phase 4: Engineering foundation`
- Relationship at the start of Phase 5 planning: local `main` matched
  `origin/main`
- The AI collaboration foundation and `docs/others/` are tracked.
- Phase 5 planning documents are being added after `609a807`.
- No Phase 5 application implementation checkpoint exists yet.

Git facts are time-sensitive. Run `corepack pnpm ai:context` before relying on
this section. Preserve `docs/others/` unless the user puts it in scope.

## Approved next outcome

Phase 5 delivers the staff-side booking core in this order:

1. business, venue, resource, activity, and offering configuration;
2. schedules, fixed slots, prices, and blocks;
3. availability and conflict-safe staff booking;
4. guest and returning customers;
5. booking lifecycle;
6. payments, dues, refunds, and reversals;
7. Today operations;
8. reporting and reconciliation.

Before implementation, turn this work order into bounded vertical slices
traced to the Phase 2 workflows, user stories, acceptance criteria, state
machines, and architecture proof obligations.

That planning exists in `docs/planning/phase-5-delivery-plan.md`. The first
implementation-ready slice is
`docs/planning/phase-5/P5-01-configuration-core.md`.

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
- Production providers, deployment, and measured Dhaka-region performance
  remain unverified.
