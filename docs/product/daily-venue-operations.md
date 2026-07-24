# Daily Venue Operations

Status: Confirmed

## Operating principle

> Staff manage the present from one fast Today workspace; managers handle
> exceptions; owners receive remote visibility; every important change is
> attributable.

## Today workspace

Primary contents:

- Resource timeline and compact booking list
- Current sessions and next arrivals
- Pending/unconfirmed bookings
- Outstanding payment
- Late customers
- Resource blocks
- Payment/refund attention items
- Handover notes
- Search by customer, phone, team, or booking reference
- Quick booking

Staff should perform ordinary work without navigating through reports and
settings.

## Starting work

```text
Sign in
→ Enter assigned venue
→ Start optional shift
→ Review handover and exceptions
→ Open Today
```

Formal shift tracking is optional. Small owner-operated venues can work without
it.

Venue availability follows its configured schedule; staff do not need to press
Open each morning for online booking to function.

## Arrival

```text
Select booking
→ Confirm customer/resource
→ Review and collect balance
→ Confirm add-ons
→ Check in
```

The booking card shows schedule, contact, total, paid, due, add-ons, source, and
important notes in one place.

## Walk-in

```text
Select resource/slot
→ Search or minimally create customer
→ Record payment
→ Confirm and check in
```

Anonymous walk-in support is configurable and should be used only where receipt,
refund, or customer-history needs permit it.

## Late arrival

Late arrival does not extend the original end. A configurable grace period
causes an operational warning.

Extension requires available capacity, calculated price, payment/due record,
and history.

## Session progress

```text
Expected → Checked in → In progress → Finished
```

Time-based suggestions may assist staff but cannot prove attendance.

At expected end, staff may finish, extend, record overtime, add an authorized
charge, or report an incident.

## Resource reassignment

Moving a booking:

- Confirms activity compatibility
- Checks alternative availability
- Recalculates any price difference
- Resolves extra due or credit
- Preserves original assignment and reason
- Notifies the customer

## Resource blocks

Block categories:

- Maintenance
- Weather
- Safety
- Cleaning
- Private use
- Event preparation
- Management hold
- Emergency

Existing affected bookings are displayed and must be explicitly moved,
rescheduled, cancelled, or retained after review.

## Maintenance

Pilot issue record:

- Resource and description
- Severity and reporter
- Time and optional attachment
- Whether a block is required
- Reported/In progress/Resolved
- Resolution note and actor

Vendor management, recurring inspections, parts, and full maintenance costing
are deferred.

## Add-on fulfillment

Pilot bookings may mark add-ons Pending, Issued/Provided, or Completed. Advanced
equipment states, quantity inventory, damage, and missing-item workflows are
deferred.

## Shifts and handover

Optional shift record:

- Employee and venue
- Start/end
- Opening/closing cash
- Handover
- Manager approval

Handover covers unresolved payments, arrivals, refunds, blocks, equipment,
incidents, and cash variance. Items may be Open, Acknowledged, or Resolved.

The product is not initially payroll, leave, or biometric attendance software.

## Sensitive operations

Rather than complex approval chains, the pilot relies on permissions:

- Staff initiates or reports
- Manager/Owner performs protected action
- Actor and reason are audited

Examples include large discount, complimentary use, refund, reversal, customer
restriction, and editing completed records. Employees use their own accounts;
shared approval credentials are discouraged.

## Incidents

Basic factual incident record:

- Venue, time, and category
- Related booking/customer/resource
- Severity and description
- People involved where necessary
- Immediate response
- Attachments
- Follow-up status

Access is restricted. The system records facts, not legal conclusions.

## Alerts

High-value alerts:

- Pending booking near expiry
- Payment awaiting verification
- Arrival or late customer
- Due at check-in
- Resource block affecting bookings
- Failed/mismatched gateway payment
- Refund action
- Cash variance
- Urgent maintenance

Use Information, Attention, and Urgent levels. In-app alerts come first.

## Owner remote view

Today summary:

- Bookings and session progress
- Booking value and collections
- Dues
- Cancellations/no-shows
- Resource use and blocks
- Refunds/discounts
- Cash variance
- Important incidents

The goal is operational visibility, not intrusive surveillance.

## Closing

Before shift/day close, show:

- Ongoing or unfinished sessions
- Dues and unverified payments
- Open refunds/incidents
- Unreturned equipment later
- Expected/count cash
- Handover items

Staff may close with unresolved items if they provide notes. Shift closure does
not close future online availability.

## Operational date

After-midnight venues need:

- Exact timestamp
- Venue timezone
- Operational business date

Store consistent timestamps and derive local operational day using a
configurable cutoff later.

## Connectivity

Core booking confirmation requires server access.

Pilot approach:

- Mobile-responsive web/PWA
- Cache Today for read-only fallback
- Show last synchronization
- Allow provisional offline notes
- Revalidate before confirming

Full offline reservation and conflict merging are deferred.

## Audit

Capture actor, tenant/venue, time, action, previous/new values, reason, source,
and related entity for important booking, payment, resource, customer, access,
and reconciliation changes.

## Private-pilot coverage

Included:

- Today timeline/list/search
- Quick and walk-in booking
- Arrival through completion
- Dues, late/no-show, extension, reassignment
- Blocks and basic maintenance notes
- Basic alerts, handover, owner summary, audit

Deferred:

- Full maintenance/inventory
- Automated staff scheduling/payroll
- Multi-level approvals
- Biometric/IoT control
- Full offline writes
- Performance scoring

