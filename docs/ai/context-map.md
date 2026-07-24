# Context Map

Status: Active routing guide

Start with `AGENTS.md`, this file, and `current-state.md`. Then load only the
sources relevant to the task.

| Task | Primary sources | Add when relevant |
|---|---|---|
| Product goal, customer, or scope | `docs/product/product-vision.md`, `docs/product/market-and-ideal-customer.md`, `docs/product/pilot-mvp-scope.md` | `docs/planning/decision-log.md`, `docs/planning/feature-catalogue.md` |
| Phase sequencing | `docs/planning/product-development-roadmap.md`, `docs/planning/all-phase-delivery-index.md`, `docs/ai/current-state.md` | the active phase plan; `docs/future/README.md` |
| Roles and permissions | `docs/product/personas-roles-and-access.md`, identity/setup workflows | tenancy/authorization architecture, ADR-008 |
| Facilities and sellable configuration | business/facility product model, setup workflows, domain model | logical data model, MVP scenario catalogue |
| Booking or availability | booking lifecycle, booking/customer workflows, acceptance criteria | state machines, capacity/concurrency design, ADR-005 |
| Customers or teams | customers/players/teams product model, booking/customer workflows | logical data model, privacy threats |
| Payments and finance | pricing/payments product model, payment workflows, acceptance criteria | money/time architecture, reporting rules |
| Today operations | daily operations product model, Today workflows, interaction designs | screen inventory, cognitive walkthroughs |
| Reporting | reporting product model, reporting workflows | money/audit architecture, acceptance criteria |
| API or client contract | API-first strategy, ADR-002, `openapi.json` | contracts and generated client code |
| Authentication | ADR-008, identity/setup workflows | threat model, auth package, API auth routes |
| Tenancy or database | ADR-004, ADR-007, logical data model | threat model, persistence migrations/tests |
| Jobs or notifications | background-jobs architecture, notification matrix, ADR-010 | jobs/worker/observability packages |
| UI or accessibility | frontend design-system architecture, ADR-013, interaction designs | test strategy, `packages/ui`, screen inventory |
| Testing | acceptance criteria, traceability matrix, test strategy | simulation fixtures and relevant package tests |
| Deployment or operations | deployment/scaling/recovery, provider strategy, engineering runbooks | NFRs, observability ADR |
| Future capability | relevant `docs/future/` brief | current MVP scope and ADRs; do not implement by default |

## Phase 5 trace chain

Every Phase 5 slice should be traceable in this direction:

```text
approved outcome
→ workflow and user story
→ acceptance criterion
→ domain invariant/state transition
→ API contract
→ persistence/concurrency rule
→ UI behavior
→ automated evidence
```

If a link is absent or contradictory, resolve the specification gap before
creating a broad implementation.

The same trace-and-gate rule applies to the later plans. Planning documents for
Phases 6–8 make future continuation predictable; they do not authorize an
agent to skip the active phase.
