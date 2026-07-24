# Analytics, Automation, and Intelligence

Status: Future capability brief
Likely horizon: H2–H3

## Purpose

Advanced analytics becomes useful only after booking, payment, customer, and
operational data is complete and trusted. Automation must remain explainable
and reversible.

## FC-701: Advanced retention and cohorts

### Value

Shows whether customer groups return and which experiences improve retention.

### Possible analysis

- First-completed-booking cohorts
- Return within 30/60/90 days
- Retention by venue, activity, source, and time
- Membership/package effect
- Churn-risk segments

### Core rules

- Cohort entry and return event are documented.
- Cancelled/expired requests do not falsely create customers.
- Cross-business data is not exposed.
- Small groups may be suppressed for privacy.

### Dependencies

- Reliable customer linking and completed booking history
- Sufficient observation window
- Metric glossary

### MVP seam

Preserve business customer identity and documented date/event definitions.

### Promotion trigger

Venues have enough repeat history to act on retention patterns.

## FC-702: Custom report builder

### Value

Allows advanced owners/finance users to answer recurring questions not covered
by standard reports.

### Representative workflow

```text
Choose trusted dataset
→ Select dimensions/measures/filters
→ Preview
→ Save/share with authorized roles
→ Export/schedule later
```

### Core rules

- Measures come from governed definitions.
- Tenant/venue permissions apply automatically.
- Query cost and row/export limits protect the platform.
- Saved reports version their definition.
- Sensitive dimensions are permissioned.

### Dependencies

- Stable semantic metric layer
- Query isolation/performance
- Export and access audit

### MVP seam

Centralize metric formulas and filters rather than duplicating report-specific
calculations.

### Promotion trigger

Standard reports are trusted but repeated valuable questions remain unmet.

## FC-703: Demand forecasting

### Value

Estimates future occupancy, staffing, and collections.

### Representative outputs

- Expected occupancy by resource/time
- Likely last-minute fill
- Collection forecast from confirmed bookings
- Maintenance-window suggestions

### Core rules

- Clearly label forecast versus confirmed facts.
- Show confidence/uncertainty and major drivers.
- Compare predicted with actual performance.
- Do not make customer-impacting decisions without review.
- Weather/event inputs need reliable source and region fit.

### Dependencies

- Sufficient clean history
- Stable operating schedules
- Model monitoring
- Explainable interface

### MVP seam

Preserve precise created/service/transaction dates, resource capacity, source,
and cancellation history.

### Promotion trigger

Several venues have enough seasonal history and owners identify actionable
forecast decisions.

## FC-704: Pricing recommendations and controlled automation

### Value

May help fill off-peak inventory and price scarce peak capacity.

### Possible progression

1. Descriptive insight: “Tuesday afternoon occupancy is 22%.”
2. Rule suggestion: “Test a 10% offer.”
3. Human-approved scheduled price experiment.
4. Bounded automated pricing only after extensive validation.

### Core rules

- Venue defines minimum/maximum and excluded periods.
- Recommendation explains evidence and estimated impact.
- Human approval is default.
- Customers see final price before booking.
- Confirmed booking prices never change.
- Experiments measure revenue and occupancy, not conversion alone.
- Fairness, consumer, and contractual review precedes automation.

### Dependencies

- Trusted utilization/revenue
- Campaign and price rule engine
- Experiment measurement
- Approval and rollback

### MVP seam

Explicit price rules, snapshots, and source/reason for adjustments.

### Promotion trigger

Data shows predictable underuse/overdemand and simpler fixed scheduled pricing
is insufficient.

## FC-705: Operational anomaly detection

### Value

Surfaces unusual discounts, reversals, refunds, cash variance, or booking
patterns for human review.

### Representative workflow

```text
Rule/model flags event
→ Authorized manager reviews source records
→ Marks explained/action required
→ Records resolution
→ Feedback improves threshold
```

### Core rules

- Flag is not an accusation.
- Explain the triggering facts.
- Restrict sensitive access.
- Provide false-positive feedback and appeal.
- Never automatically penalize staff or customers.
- Keep model/rule version and result history.

### Dependencies

- Complete audit/financial events
- Manager review workflow
- Privacy/fairness review

### MVP seam

Capture actor, reason, before/after values, and financial references.

### Promotion trigger

Owners trust base reports and exception review has measurable value.

## FC-706: Workflow automation

### Candidate automations

- Expire unpaid pending bookings
- Send reminders
- Request due payment
- Offer cancelled slots to wait list
- Generate recurring maintenance tasks
- Notify owner of cash variance
- Schedule subscription reminders

### Core rules

- Trigger, condition, action, and actor/system identity are visible.
- Actions are idempotent.
- Retries and failures are observable.
- Financial/destructive actions require appropriate approval.
- Tenant can disable optional automation.
- Automation records a complete audit trail.

### MVP seam

Background jobs and system-generated actions use the same domain invariants and
audit path as human actions.

### Promotion trigger

A manual process is stable, repeated, measurable, and safe to automate.

## FC-707: Cross-business benchmarking

### Value

Could compare a venue with anonymized segment norms.

### Risks and rules

- Requires sufficiently large anonymized groups.
- Never reveal competitor or customer information.
- Define comparable venue type, city, sport, and capacity.
- Allow businesses to understand or opt into data use as required.
- Avoid misleading ranking from incomplete booking capture.

### Dependencies

- Broad trusted adoption
- Privacy/legal review
- Data-quality thresholds
- Statistical disclosure controls

### Promotion trigger

The platform has enough representative, permissioned data for safe and useful
comparison.

## Intelligence principle

> Start with trusted facts, then explainable insights, then human-approved
> automation. Do not begin with opaque AI.
