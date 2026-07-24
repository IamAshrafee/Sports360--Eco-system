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
| 5 — Staff-side booking core | Next planned phase | Not started by this checkpoint |
| 6+ | Deferred | Roadmap and future-product briefs |

Phase 4 created the executable foundation. It does not mean booking,
customers, payments, scheduling, Today operations, or reporting are already
implemented.

## Repository checkpoint

- Branch when reviewed: `main`
- Local Phase 4 commit: `716c410 Phase 4: Engineering foundation`
- Relationship when reviewed: local `main` was one commit ahead of
  `origin/main`
- Existing untracked user material: `docs/others/`
- No Phase 5 implementation checkpoint exists yet.

Git facts are time-sensitive. Run `corepack pnpm ai:context` before relying on
this section. Do not modify or stage `docs/others/` unless the user puts it in
scope.

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
