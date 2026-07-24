# Workforce, Equipment, and Facility Operations

Status: Future capability brief
Likely horizon: H2–H3

## Purpose

The pilot manages bookings and basic resource issues. Deeper operational
capabilities may reduce downtime, control equipment, and coordinate staff, but
must not turn the product into an undifferentiated ERP.

## FC-501: Planned maintenance and work orders

### Value

Moves from simple issue notes to planned upkeep and accountable repair.

### Representative workflow

```text
Issue/inspection/recurrence creates work order
→ Assess priority and resource impact
→ Assign employee/vendor
→ Reserve maintenance window
→ Record labor/parts/cost
→ Verify and close
```

### Core rules

- Issue, work order, and resource block are separate but linked.
- Safety-critical issues can immediately block availability.
- A block affecting bookings triggers customer-resolution workflow.
- Recurring maintenance generates future work without duplicating closure.
- Completion records actor, evidence, cost, and next due date.
- Reopening preserves prior resolution history.

### Dependencies

- Resource blocks
- Staff/vendor assignment
- Expense and attachment
- Notification
- Preventive schedule

### MVP seam

Pilot issue records have resource, severity, status, reporter, and resolution
references that can later link to work orders.

### Promotion trigger

Downtime or maintenance cost is material and several venues need accountability
beyond notes.

## FC-502: Equipment inventory and rental

### Value

Tracks limited balls, rackets, bibs, lockers, and other rentable/consumable
items.

### Representative workflow

```text
Create inventory item/location
→ Reserve with booking
→ Prepare and issue
→ Return/inspect
→ Record damage/loss/charge
→ Restock/repair/retire
```

### Core rules

- Distinguish serialized assets, quantity stock, and consumables.
- Reservation cannot exceed available quantity for the interval.
- Issued, returned, damaged, missing, repair, and retired are auditable.
- Customer damage charge is explicit and authorized.
- Inventory transfer preserves location and custody history.
- Stock adjustment requires reason.

### Dependencies

- Add-ons
- Time-aware inventory availability
- Staff custody
- Expense/purchase
- Damage/incident

### MVP seam

Add-on lines preserve quantity and fulfillment status; do not pretend all
add-ons have unlimited stock.

### Promotion trigger

Rental/add-on revenue or loss is meaningful and manual counting causes repeated
problems.

## FC-503: Workforce scheduling

### Value

Ensures required reception, coaching, cleaning, and support coverage.

### Representative workflow

```text
Define roles/coverage requirements
→ Create schedule
→ Assign available employees
→ Publish
→ Record changes/absence
→ Compare planned versus actual
```

### Core rules

- Business access membership is separate from employment schedule.
- Availability, leave, shift, and actual attendance are distinct.
- Employees see only appropriate schedules.
- Changes and swaps require acknowledgement/approval as configured.
- Venue opening coverage warnings do not automatically alter booking
  availability.

### Dependencies

- Employee profiles
- Venue operating schedule
- Notification
- Optional attendance

### MVP seam

Optional shift records and venue assignments are separate from authorization.

### Promotion trigger

Pilot venues have enough staff/venues that scheduling creates repeated owner or
manager work.

## FC-504: Attendance, commission, and payroll connection

### Value

May connect actual work and service delivery to compensation.

### Core rules

- System access events are not reliable attendance.
- Coach/referee commission may be per session, fixed, percentage, or tiered.
- Compensation rules are versioned and snapshot at earning time.
- Adjustments require approval and audit.
- Payroll calculation, labor law, tax, and benefits require specialist review.

### Recommended boundary

Prefer accurate attendance/earning exports or integrations before building a
complete payroll product.

### Dependencies

- Workforce schedule
- Session completion
- Commission ledger
- Finance/accounting integration
- Legal review

### Promotion trigger

A common repeatable compensation model emerges and integration is insufficient.

## FC-505: Incident and safety management

### Value

Supports structured follow-up for injury, misconduct, property damage, security,
and operational failure.

### Representative workflow

```text
Report factual incident
→ Restrict access
→ Assign follow-up
→ Attach evidence
→ Record corrective action
→ Close with retention controls
```

### Core rules

- Sensitive role-based access
- Factual description and change history
- Separate customer restriction from incident conclusion
- Retention and disclosure policy
- Emergency response is not replaced by software workflow
- Health, child, and legal data receive specialized treatment

### Dependencies

- Audit and attachments
- Customer/resource/staff relationships
- Legal/privacy policy
- Notification/escalation

### MVP seam

Pilot incident notes use restricted access and entity links without claiming a
full safety system.

### Promotion trigger

Operational/legal need is validated and the business can maintain required
policies and support.

## FC-506: Facility checklists

### Value

Standardizes opening, closing, cleaning, safety, and resource inspection.

### Representative workflow

```text
Template assigned by venue/time
→ Employee completes items/evidence
→ Failure creates issue/block
→ Manager reviews exception
```

### Core rules

- Templates are versioned.
- Completion actor/time and exceptions are preserved.
- Critical failure can propose—not silently create—resource closure.
- Checklist is not proof of regulatory compliance unless reviewed accordingly.

### Dependencies

- Shifts/tasks
- Maintenance
- Attachments
- Alerts

### MVP seam

Handover and issue records can later reference checklist runs.

### Promotion trigger

Multi-staff operations show recurring quality/safety inconsistency.

## FC-507: IoT access, lighting, and occupancy

### Value

May automate gates, lights, energy use, or physical occupancy.

### Representative workflow

```text
Confirmed eligible booking
→ Issue time-limited access/automation command
→ Device acknowledges
→ Monitor status
→ Revoke/expire
→ Fallback to staff on failure
```

### Core rules

- A booking never relies on an unverified device command.
- Offline/manual fallback exists.
- Credentials are short-lived and least-privilege.
- Device events are audited but do not alone prove attendance.
- Safety-critical controls fail safely.
- Vendor/device isolation and update lifecycle are defined.

### Dependencies

- Mature booking reliability
- Device gateway
- Security/threat review
- Venue network/support
- Incident response

### MVP seam

Stable booking/resource identifiers and event/adaptor boundaries; no device code
in core domain logic.

### Promotion trigger

Specific venue partners demonstrate clear cost/control value and can support
hardware operations.
