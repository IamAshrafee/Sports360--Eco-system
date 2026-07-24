# All-Phase Delivery Index

Status: Active roadmap control

Last reviewed: 2026-07-24

## Purpose

This index gives every roadmap phase one clear operating status, evidence path,
and continuation path. Completed phases remain historical records. Remaining
phases use master delivery plans and bounded task briefs.

| Phase | State | Control document | First/next task |
|---|---|---|---|
| 0 — Product foundation | Complete | Product knowledge base and roadmap completion record | No implementation task; change only through the decision process |
| 1 — Evidence and scenarios | Complete | Research index, simulations, and roadmap completion record | New evidence updates assumptions; it does not reopen the phase |
| 2 — Detailed specification | Complete | Specification index, workflows, stories, criteria, and traceability | Amend only when an approved product change requires it |
| 3 — Architecture | Complete | Architecture hub, 13 ADRs, threat model, and gate review | New architectural decisions require an ADR |
| 4 — Engineering foundation | Complete | `docs/engineering/phase-4-foundation.md` | Extend through forward changes; do not rebuild the foundation |
| 5 — Staff-side booking core | Implementation active; P5-01 complete | [Phase 5 delivery plan](phase-5-delivery-plan.md) | P5-02 Schedule and Fixed Slots |
| 6 — Customer booking and pilot SaaS | Planned; gated by Phase 5 | [Phase 6 delivery plan](phase-6-delivery-plan.md) | [P6-01 Published Public Catalogue](phase-6/P6-01-published-public-catalogue.md) |
| 7 — Founder-operated simulated pilot | Planned; gated by Phase 6 | [Phase 7 delivery plan](phase-7-delivery-plan.md) | [P7-01 Simulation Harness](phase-7/P7-01-simulation-harness.md) |
| 8 — Organic beta and commercial evidence | Planned; gated by Phase 7 | [Phase 8 delivery plan](phase-8-delivery-plan.md) | [P8-01 Organic-Beta Readiness Gate](phase-8/P8-01-organic-beta-readiness-gate.md) |

## Sequential rule

```text
Phase plan
→ bounded task brief
→ implementation or evaluation
→ fresh verification
→ phase handoff
→ exit-gate evidence
→ next phase entry review
```

Planning a future phase does not activate it. Only the current phase may
implement product behavior, except for explicitly approved prerequisites that
do not skip the current exit gate.

## Completed-phase maintenance

Phases 0–4 do not need newly invented task plans. Their documents already serve
as:

- the product baseline;
- the evidence and assumption record;
- the testable specification;
- the accepted architecture;
- the executable engineering foundation.

If later evidence changes one of them:

1. record the new evidence;
2. raise the conflict/open question;
3. record the approved decision;
4. update every affected source;
5. add or revise the active/future task brief.

Never silently rewrite a completed phase to make a later implementation appear
consistent.

## Phase-entry rule

Before starting the first task in a phase, an agent must:

1. prove the previous phase exit gate;
2. run `./scripts/pnpmw ai:context`;
3. reconcile the master plan with current code and Git state;
4. identify any outdated assumption or provider fact;
5. confirm that the first task remains the smallest useful next outcome;
6. update `docs/ai/current-state.md` from “planned” to “active” only when work
   genuinely begins.

## Phase-exit rule

A phase is complete only when:

- every release-blocking slice is implemented or explicitly removed through an
  approved scope decision;
- the phase-specific integration gate passes;
- deferred/unverified behavior is named honestly;
- recovery, security, tenant, money, time, accessibility, and observability
  evidence is complete where applicable;
- `docs/ai/handoff.md`, the roadmap, and current state agree;
- a recoverable Git checkpoint exists.

## After Phase 8

Phase 8 does not automatically activate H1–H3 capabilities. Organic usage and
commercial evidence feed the future-capability promotion process:

```text
evidence
→ horizon review
→ decision
→ Level-3 delivery specification
→ architecture review
→ new roadmap phase
```

This prevents the long-term blueprint from becoming an uncontrolled backlog.
