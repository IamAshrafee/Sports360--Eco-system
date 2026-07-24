# Solo-Founder Validation Plan

Status: Active research strategy

## Constraint

The project is being planned and developed by one developer without a company
team, established market identity, or dependable access to venue owners and
staff.

The active plan therefore does not require:

- Cold outreach
- Owner/staff interviews
- On-site observation
- A recruited design partner
- A sales team or established brand

Those activities remain optional if they become naturally available later.

## Honest limitation

Desk research and simulation cannot prove:

- That staff will adopt the workflow
- That owners will trust the reports
- Actual willingness to pay
- Frequency of every operational edge case
- Real support and onboarding burden

These remain assumptions until organic usage produces evidence. The purpose of
this strategy is to develop responsibly despite that uncertainty—not to pretend
the uncertainty has disappeared.

## Evidence ladder

| Level | Evidence | Confidence |
|---|---|---|
| E0 | Founder intuition | Low |
| E1 | Public venue pages, rate cards, policies, booking messages | Low–moderate |
| E2 | Repeated competitor features, reviews, and public user complaints | Moderate for problem existence |
| E3 | Executable scenario simulation and consistency tests | High for internal system behavior |
| E4 | Anonymous/organic beta telemetry and in-product feedback | Moderate–high for actual usage |
| E5 | Continued paid organic usage | High for delivered value and willingness to pay |

No E1–E3 evidence should be described as customer validation.

## Track 1: Public market evidence

Collect only publicly available information:

- Venue websites and social pages
- Published opening hours and slot prices
- Booking instructions
- Cancellation/refund policies
- Public customer reviews
- App-store reviews
- Competitor landing pages and demos
- Payment-provider documentation
- Public business forms and rate cards

For every observation record:

```text
Source:
Access date:
Observed fact:
Vendor/customer claim:
Inference:
Assumption affected:
Confidence:
```

Facts, marketing claims, and our inference must remain separate.

## Track 2: Competitor-flow analysis

For each accessible local or regional product:

1. Map customer registration and booking.
2. Map venue discovery and availability.
3. Record payment and confirmation behavior.
4. Record cancellation/refund handling.
5. Review owner-side features visible publicly.
6. Note missing states and confusing terminology.
7. Compare the workflow with our product principles.

The goal is not to copy UI. It is to learn which domain problems repeatedly
appear and where a business-management-first product may differ.

## Track 3: Venue archetypes

Design and maintain synthetic businesses representing different operational
shapes:

### V-01: Single high-volume football turf

- One resource
- Evening peak rates
- Mostly team-organizer bookings
- Advance through manual MFS

### V-02: Multi-court badminton venue

- Four independent courts
- Morning/evening pricing
- Walk-ins and recurring regulars
- Equipment rental

### V-03: Mixed-sport complex

- Two football turfs
- Three badminton courts
- Four table-tennis tables
- Owner, manager, two booking staff

### V-04: Cricket practice facility

- Several independent nets
- Coaching and ordinary rental
- Flexible duration deferred but represented as a future pressure

### V-05: Late-night venue

- Operations cross midnight
- Shift handover
- Cash and digital reconciliation

### V-06: Future multi-venue business

- Two branches
- Shared owner and finance role
- Branch-specific staff and reports
- Used to verify architectural seams, not pilot UI

Each archetype receives configuration, sample customers, future bookings,
payments, exceptions, and reports.

## Track 4: Scenario catalogue

Simulate normal and exceptional days:

### Booking

- Phone, message, walk-in, and online requests
- Concurrent attempt for the same slot
- Pending advance expiry
- Back-to-back bookings
- Reschedule into a different price
- Customer and venue cancellation
- No-show and late arrival
- Conflict-free and rejected extension

### Money

- No advance, fixed advance, percentage advance, full payment
- Multiple partial payments
- Incorrect manual payment reversal
- Partial/full refund
- Gateway late success and duplicate callback later
- Cash-closing variance
- Due-at-arrival versus overdue balance

### Operations

- Resource failure with affected bookings
- Resource reassignment
- Staff handover
- After-midnight operational day
- Restricted customer
- Employee attempting unauthorized refund/export

### SaaS

- Trial activation and expiry
- Limit reached
- Past due and grace
- Restriction and safe reactivation
- Downgrade without data deletion

Each scenario should later become acceptance criteria and automated tests.

## Track 5: Prototype-based evaluation

Before production code:

- Create low-fidelity workflows
- Test completion using scripted personas
- Measure number of actions for quick booking
- Check visibility of price, paid, due, status, and next action
- Run mobile viewport and accessibility review
- Identify screens requiring business knowledge

This evaluates internal clarity. It does not replace real usability testing.

## Track 6: Organic beta evidence

When the product is safe enough:

- Publish a self-service or invitation-link beta
- Provide clear experimental status
- Add optional in-product feedback
- Capture privacy-conscious operational telemetry
- Measure activation, setup completion, booking creation, return use, and errors
- Allow users to leave without a sales call
- Offer support through a simple asynchronous channel

No direct interview is required. If users voluntarily send feedback, record it
as organic evidence.

## Track 7: Commercial evidence

Willingness to pay is considered supported only by behavior such as:

- Starting a paid subscription
- Continuing after a trial
- Renewing
- Expanding venue/resource use
- Choosing a paid feature

Survey enthusiasm and competitor pricing alone do not validate our price.

## Risk-control strategy

Because external validation is delayed:

- Keep the MVP smaller.
- Prefer reversible product and architecture decisions.
- Use curated defaults with configuration seams.
- Avoid regulated marketplace money and sensitive community features.
- Build complete audit and export paths.
- Add telemetry only with appropriate notice and minimization.
- Do not optimize heavily for one imagined venue.
- Review assumptions after organic usage.

## Active sequence

```text
Public research
→ Venue archetypes
→ Scenario catalogue
→ Detailed workflows and acceptance criteria
→ Domain/data/architecture
→ Internal simulated operations
→ Safe organic beta
→ Evidence-led iteration
```

## Exit criteria before technical architecture

- Public examples for core schedule/pricing/payment patterns
- Six documented venue archetypes
- Complete MVP scenario catalogue
- Detailed workflows for every pilot actor
- Explicit confidence level for each important market assumption
- No architecture-critical ambiguity in money, time, tenancy, or conflicts

## Exit criteria before organic beta

- Internal operational simulation passes
- Security and tenant-isolation tests pass
- Backup restoration is tested
- Reports reconcile
- Clear privacy/terms/support contact exists
- Onboarding can be completed without direct founder assistance

