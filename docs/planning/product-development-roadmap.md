# Product Development Roadmap

Status: Active plan

This roadmap controls the order of product and engineering work. Stage gates
exist to prevent unvalidated assumptions from becoming expensive code.

## Phase 0: Product foundation

Status: Complete

Outputs:

- Product vision and positioning
- Initial market and ideal customer
- Roles and access strategy
- Facility, booking, pricing, customer, operations, reporting, and SaaS models
- Private-pilot MVP boundary
- Future product horizons and capability briefs
- Decision, assumption, feature, glossary, and research system

Exit condition:

- Confirmed planning documents are internally consistent and navigable.

## Phase 1: Solo-founder evidence and scenario design

Status: Complete

Work:

1. Extend Bangladesh desk research using public venue and competitor material.
2. Map accessible competitor booking and management flows.
3. Build six documented synthetic venue archetypes.
4. Create realistic schedules, rates, customers, bookings, payments, blocks,
   and staff assignments for each archetype.
5. Build the complete normal and exceptional scenario catalogue.
6. Grade every important assumption by evidence confidence.
7. Update the decision log without describing desk research as validation.

Outputs:

- Public evidence notes and competitor-flow maps
- Six venue archetype specifications
- Scenario catalogue that can become acceptance and automated tests
- Evidence-confidence updates
- Revised MVP only where evidence warrants it
- Initial price hypothesis, explicitly unvalidated until organic payment

Exit conditions:

- Public examples cover core schedule, pricing, payment, and policy patterns.
- Six archetypes cover the intended MVP operational range.
- Normal and exceptional workflows are represented.
- Architecture-critical assumptions about money, time, tenancy, and conflicts
  are explicit.
- No direct owner/staff contact is required.

## Phase 2: Detailed product specification

Status: Next

Work:

1. Map end-to-end workflows for each MVP actor.
2. Write prioritized epics and user stories.
3. Add acceptance criteria and exception cases.
4. Define notification events and message responsibilities.
5. Define screen inventory and navigation.
6. Create low-fidelity interaction designs.
7. Run scripted persona and cognitive walkthroughs on quick booking and Today.
8. Define non-functional requirements.

Outputs:

- Workflow catalogue
- User-story backlog
- Acceptance criteria
- Screen/route inventory
- Low-fidelity wireframes
- Notification matrix
- Non-functional requirements

Exit conditions:

- Every pilot outcome maps to an accepted workflow and story.
- Core staff tasks are understandable without explanation.
- Major error and permission paths are specified.

## Phase 3: Domain, data, and technical architecture

Work:

1. Define aggregates, entities, value objects, and invariants.
2. Create logical data model and lifecycle/state diagrams.
3. Define tenant-isolation strategy.
4. Define conflict-safe interval and transaction approach.
5. Select application topology, stack, database, authentication, hosting,
   notification, and observability providers.
6. Define API boundaries and background jobs.
7. Model money, audit, idempotency, and time handling.
8. Document architecture decisions as ADRs.
9. Create security and threat model.

Outputs:

- Domain model
- ERD/data dictionary
- State and sequence diagrams
- Architecture overview
- ADR collection
- API contract strategy
- Security/threat model
- Test strategy

Exit conditions:

- Booking conflict safety is proven in design.
- Tenant authorization boundaries are explicit.
- Money and time representations are unambiguous.
- Deployment and recovery approach is feasible for a solo developer.

## Phase 4: Engineering foundation

Work:

1. Create repository/application structure.
2. Configure development, CI, code quality, and test tooling.
3. Implement identity, tenant, membership, and authorization.
4. Implement audit and platform-administration foundations.
5. Add database migrations, seed/demo data, and environment management.
6. Configure error reporting, structured logging, backup, and restore process.

Exit conditions:

- Automated tenant-isolation and permission tests pass.
- Environments are reproducible.
- Backup restoration has been exercised.
- Sensitive information is absent from logs.

## Phase 5: Staff-side booking core

Work order:

1. Business/venue/resource/activity/offering configuration
2. Schedules, fixed slots, prices, and blocks
3. Availability and conflict-safe staff booking
4. Guest/returning customers
5. Booking lifecycle
6. Payments, dues, refunds, and reversals
7. Today operations
8. Core reporting and reconciliation

Exit conditions:

- Internal simulation passes busy-day scenarios.
- Standard booking takes under one minute after training.
- Reports reconcile with source records.
- No system-created conflict under concurrency testing.

## Phase 6: Customer booking and pilot SaaS

Work:

1. Public venue booking page
2. OTP customer flow
3. Temporary holds and expiry
4. Confirmation/shareable links
5. Transactional notifications
6. Pilot onboarding checklist and entitlements
7. Manual subscription administration
8. Mobile and accessibility refinement

Exit conditions:

- Customer and staff channels share accurate availability.
- Failed notification does not corrupt booking state.
- Pilot tenant can be safely activated, restricted, and restored.

## Phase 7: Founder-operated simulated pilot

Work:

1. Configure every synthetic venue archetype.
2. Seed realistic upcoming and historical activity.
3. Run complete busy-day and after-midnight simulations.
4. Exercise owner, manager, booking-staff, finance, customer, and platform roles.
5. Reconcile booking, money, utilization, and audit reports.
6. Run concurrency, security, recovery, and failure scenarios.
7. Fix blockers before opening an organic beta.

Exit conditions:

- All MVP scenarios pass.
- Financial summaries reconcile to source transactions.
- Tenant/role boundaries pass automated tests.
- Backup restoration is demonstrated.
- Self-service onboarding can complete without direct founder setup.
- No claim of real customer validation is made.

## Phase 8: Organic beta and commercial evidence

Sequence:

1. Publish a clearly labelled self-service/invitation-link beta.
2. Allow users to adopt without a required interview or sales call.
3. Capture privacy-conscious activation, use, error, and retention telemetry.
4. Accept optional asynchronous in-product feedback.
5. Resolve generalization and onboarding problems shown by organic behavior.
6. Test a transparent price or paid plan when the product is safe.
7. Integrate one selected gateway when operational and merchant requirements are
   understood.
8. Add required commercial support, policy, and legal readiness.
9. Launch commercial v1 only after usage and payment evidence support it.

## Work-control rules

- One phase may prepare research for the next, but no phase gate is silently
  skipped.
- Every new feature maps to an approved pilot outcome or remains deferred.
- A future capability may be documented deeply without entering the active
  delivery scope.
- Public or organic evidence updates assumptions before it updates scope.
- Desk research and simulation improve design confidence but do not prove
  adoption or willingness to pay.
- Architecture choices are recorded with alternatives and consequences.
- Security, tenant isolation, conflict safety, exact money, and recoverability
  are release requirements, not post-launch enhancements.
