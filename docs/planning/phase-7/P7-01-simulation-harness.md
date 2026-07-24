# P7-01 — Deterministic Simulation Harness

Status: Implementation-ready; blocked until the Phase 7 entry gate passes.

## Outcome

Provide a safe, repeatable mechanism that can prepare, run, assert, and report each approved synthetic business scenario without adding product features or touching non-synthetic data.

## Read before implementation

- [Phase 7 delivery plan](../phase-7-delivery-plan.md)
- [Simulation catalogue](../../research/simulations/README.md)
- [Non-functional requirements](../../specification/non-functional-requirements.md)
- [Security threat model](../../architecture/security-threat-model.md)
- [Deployment, scaling, and recovery](../../architecture/deployment-scaling-and-recovery.md)
- [Human-to-agent task guide](../../ai/human-agent-task-guide.md)

## In scope

- a versioned fixture contract for organizations, venues, resources, schedules, actors, bookings, payments, expenses, and expected totals;
- a scenario registry mapping V01–V06 to their fixture, execution steps, assertions, and evidence;
- explicit creation and reset commands for synthetic tenants;
- deterministic identifiers or aliases that make assertions stable;
- isolation guards that reject broad, production, or unrecognized cleanup targets;
- machine-readable results plus a concise human-readable run report;
- provenance containing commit, schema, scenario, environment, and execution timestamps;
- a convention for separating product defects from harness defects;
- automated tests for the harness safety and reproducibility rules.

## Out of scope

- implementing or changing missing booking, payment, reporting, notification, or subscription behavior;
- weakening assertions so an existing product defect passes;
- using real owner, staff, customer, phone, email, or payment data;
- production load testing or Phase 8 deployment;
- contacting users or claiming market validation;
- adding future-horizon product capabilities.

## Contract rules

1. Every generated organization and actor is visibly marked synthetic.
2. A reset requires an exact scenario-owned tenant identifier and refuses unknown targets.
3. Fixtures are versioned; changing expected business behavior requires a reviewed fixture-version change.
4. Expected financial values are stored as integer minor units and reconcile from source events.
5. Time-dependent scenarios use an explicit clock or fixed reference time.
6. Running the same scenario twice from a clean state produces equivalent business results.
7. Reports distinguish setup, execution, assertion, cleanup, and environmental failures.
8. The harness may call public or internal product interfaces approved for testing, but may not bypass invariants to manufacture a pass.

## Suggested interfaces

The implementer may refine names to fit the repository, but the workflow should remain equivalent:

```text
simulation:prepare <scenario-id>
simulation:run <scenario-id>
simulation:assert <scenario-id>
simulation:reset <scenario-id>
simulation:report <run-id>
```

A combined command is acceptable if individual failure stages remain visible and cleanup is never implicit after a failed run.

## Verification

- schema/fixture validation rejects incomplete or invalid scenarios;
- two clean runs of one scenario yield the same expected totals;
- two different scenarios remain tenant-isolated;
- reset is idempotent for its exact synthetic target;
- reset rejects missing, broad, production, and unrecognized targets;
- a deliberately false expected total fails with a useful report;
- an interrupted run remains diagnosable and safely cleanable;
- no secret or real personal data appears in fixtures or artifacts;
- repository lint, typecheck, tests, build, and AI workflow verification pass.

## Completion evidence

- paths to the registry, fixture schema, runner, assertions, and reports;
- commands and summarized output for the verification cases;
- one sample passing run and one intentional failing run;
- confirmation that no product behavior was added;
- remaining risks and the next recommended scenario task.

## Agent assignment prompt

> Implement P7-01 exactly as defined in `docs/planning/phase-7/P7-01-simulation-harness.md`. First load repository context and follow the Sports SaaS engineering skill. Do not implement missing product features or use real data. Build a deterministic, tenant-safe simulation fixture and execution contract, verify the required safety and reproducibility cases, update tests and documentation, then run the repository verification workflow and record evidence in the handoff.
