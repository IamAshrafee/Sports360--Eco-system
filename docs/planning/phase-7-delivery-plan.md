# Phase 7 — Founder-Operated Simulated Pilot

Status: Planned; blocked until the Phase 6 exit gate passes.

## Objective

Operate the complete MVP as a founder using deterministic synthetic businesses, staff, customers, bookings, payments, expenses, and failure conditions. The phase must reveal operational defects and prove that the system behaves coherently without claiming real-customer validation.

## Entry gate

Phase 7 may start only when:

- the Phase 6 integration and release-candidate gate passes;
- all six documented simulation archetypes still match the approved MVP;
- deterministic seed and cleanup mechanisms exist for synthetic data;
- tenant, role, booking, finance, reporting, notification, subscription, and public-booking paths are testable together;
- open critical security, data-integrity, or recovery defects are zero.

## Working principles

- Simulations exercise the approved product; they do not silently invent features.
- A failed scenario creates a narrowly scoped defect task with reproducible evidence.
- Every person, organization, payment, and message is clearly synthetic.
- Financial assertions use explicit expected totals, not visual plausibility.
- Every approved actor is tested with both allowed and denied actions.
- Future-product pressure is recorded as evidence, but deferred capabilities remain unavailable.
- A successful simulated pilot is technical and operational evidence, not market validation.

## Delivery slices

### P7-00 — Freeze the release candidate and coverage manifest

Capture the exact commit, schema version, configuration, providers, feature flags, scenario versions, and required evidence for the simulated pilot.

Gate:

- the tested release candidate is immutable during a run;
- every MVP capability maps to at least one scenario or cross-cutting exercise;
- any candidate change starts a new recorded run.

### P7-01 — Deterministic simulation harness

Create the repeatable fixture, reset, execution, assertion, and reporting contract used by all scenarios.

Gate:

- the same scenario produces the same expected state and financial totals;
- reset affects only explicitly identified synthetic tenants;
- scenario evidence can be reproduced from documented commands;
- the harness does not implement missing product behavior.

Implementation brief: [P7-01 deterministic simulation harness](./phase-7/P7-01-simulation-harness.md)

### P7-02 — V01 single football turf

Run the single-resource, owner-operated turf scenario through configuration, availability, booking, payment, expense, reporting, cancellation, and day-close workflows.

Gate:

- expected availability and money movements reconcile;
- owner workflows work on the supported mobile viewport;
- denied and invalid transitions are covered.

### P7-03 — V02 multi-court badminton venue

Exercise several similar courts, overlapping demand, staff operations, resource-specific availability, partial payments, and consolidated reporting.

Gate:

- court identity cannot be confused across booking and finance views;
- overlapping valid bookings are permitted only on different resources;
- per-resource and venue totals reconcile.

### P7-04 — V03 mixed-sports complex

Exercise different sports, durations, prices, operating rules, staff assignments, and public catalogue presentation within one tenant.

Gate:

- sport-specific configuration remains independent;
- the public and staff availability views agree;
- consolidated reporting does not erase resource-level detail.

### P7-05 — V04 cricket ground

Exercise long-duration reservations, deposits, balance collection, operational notes, closure periods, and cancellation consequences.

Gate:

- long bookings cannot be fragmented or overbooked;
- payment balance and booking status remain independently correct;
- closures and cancellations produce an auditable history.

### P7-06 — V05 late-night venue

Exercise after-midnight schedules, Bangladesh-local business dates, staff shifts, reports, notifications, and cancellation rules.

Gate:

- UTC storage and Asia/Dhaka presentation remain consistent;
- a booking crossing midnight belongs to the intended business day;
- no report or notification silently shifts the booking to the wrong date.

### P7-07 — V06 multi-venue pressure scenario

Exercise multiple venues under one organization while deliberately confirming MVP boundaries around cross-venue control and reporting.

Gate:

- tenant isolation remains absolute;
- supported multi-venue behavior is correct;
- deferred cross-venue capabilities are visibly unavailable rather than partially implemented;
- observed demand is recorded for later horizon decisions.

### P7-08 — Cross-cutting pressure and abuse exercises

Run concurrency, duplicate request, authorization, tenant isolation, rate-limit, accessibility, performance, notification retry, and degraded-provider exercises across the candidate.

Gate:

- double-booking and duplicate financial writes remain impossible;
- every denied action fails safely and is auditable where required;
- accessibility and performance meet the Phase 6 release thresholds;
- retries do not create duplicate customer effects.

### P7-09 — Recovery and operator drills

Exercise database restore, job replay, provider outage, notification backlog, credential rotation, incident triage, and rollback documentation.

Gate:

- a restore drill meets the documented recovery objective;
- replay and reconciliation procedures are deterministic;
- the solo operator can identify, contain, and communicate a simulated incident;
- provider loss has a documented fallback or accepted risk.

### P7-10 — Readiness report and Phase 7 exit

Consolidate scenario results, defects, unresolved risks, evidence, and a Phase 8 recommendation.

Gate:

- all six MVP scenarios have passing recorded runs;
- booking, payment, expense, and report totals reconcile;
- tenant and role boundaries pass;
- restore and operator drills pass;
- self-service onboarding completes without hidden manual database work;
- critical and high-severity defects are resolved or explicitly block exit;
- the report states that no real-customer validation has occurred.

## Required evidence

For every scenario run, retain:

- release-candidate identifier and scenario version;
- deterministic input manifest;
- actor and role coverage;
- expected and actual booking/financial totals;
- automated and manual check results;
- screenshots only where visual evidence adds value;
- defects linked to reproducible steps;
- cleanup result and synthetic-tenant identifiers.

## Phase completion

Phase 7 is complete only when P7-10 passes. Completion means the product has credible internal technical and operational evidence. It does not prove demand, usability with real owners, willingness to pay, or commercial readiness.
