# Reporting and Analytics

Status: Confirmed

## Principle

> Every metric answers a business question, has a documented formula and date
> basis, and drills down to the records that produced it.

## Date perspectives

A report must identify whether its date filter means:

- Booking-created date
- Service/playing date
- Transaction date
- Refund date
- Operational business date

Do not silently mix them.

## Owner dashboard

Primary questions:

- What is happening today?
- What was booked and completed?
- What money was collected or returned?
- What remains due?
- Which resources are busy, blocked, or underused?
- Are discounts, cancellations, or cash variances unusual?
- Are customers returning?

## Financial definitions

```text
Gross booking value
- Discounts
= Net booking value before configured tax/service lines
```

Completed-booking revenue is the final value of fulfilled services plus valid
retained cancellation/no-show fees. Future pending bookings are not completed
revenue.

```text
Net collections = Successful payments - Completed refunds
Outstanding = Current total - Net paid
```

Separate due-at-arrival from overdue debt. Aging may show 1–7, 8–30, and over
30 days after an actual due date.

## Booking report

Metrics:

- Pending, confirmed, completed, cancelled, expired, and no-show counts
- Average booking value and duration
- Rescheduling
- Booking lead time
- Source channel
- Customer/venue cancellation distinction

Filters:

- Venue, resource, activity, offering
- Status and payment state
- Source and creating employee
- Customer/team
- Date/time perspective

## Lead time

```text
Playing start - Booking creation
```

Useful groups include immediate/walk-in, under six hours, same day, 1–3 days,
4–7 days, and over seven days.

## Utilization

```text
Available capacity = Operating resource-minutes - Blocked resource-minutes
Reserved occupancy = Reserved minutes / Available capacity
Played utilization = Completed playing minutes / Available capacity
```

No-shows consumed reserved capacity but not played utilization. Both measures
are reported.

Resource efficiency may include:

- Revenue per available hour
- Revenue per reserved hour
- Average price/value
- Discount rate
- Downtime and affected bookings

## Time and channel analysis

Day/time summaries reveal peak and underused periods. Source reports compare
confirmed/completed bookings, value, cancellation, expiry, and no-show across
customer page, phone, message, walk-in, staff, and later integrations.

## Customer definitions

A new customer has their first completed booking with the business in the
selected period. A returning customer completed a previous booking and another
in the period.

Metrics may include:

- New and returning customers
- Booking frequency
- Average booking value
- Last visit
- Dues
- Cancellation/no-show history
- Simple 30/60/90-day return

Advanced cohorts and cross-business reputation are deferred.

## Financial exceptions

Dedicated reports cover:

- Discounts and complimentary use
- Refunds and reversals
- Cancellation fees
- Actor and reason
- Payment-method collections
- Unverified manual payments
- Gateway fees and settlement later
- Cash variance

These reports support investigation without automatically accusing employees.

## Expenses and operating result

Future/basic expense reports group venue, category, method, vendor, and approval.

```text
Completed-booking revenue
+ Other recorded operating income
- Recorded operating expenses
- Gateway fees
= Estimated operational result
```

Label this as an estimate, not audited or statutory profit.

## Branch, resource, staff, and maintenance views

Branch/resource comparison uses normalized measures such as occupancy and
revenue per available hour, not only totals.

Staff reports show attributable actions—bookings, payments, discounts, refunds,
blocks, restrictions, and reconciliation—without an opaque performance score.

Maintenance reports may show issue count, blocked hours, affected bookings,
resolution time, and estimated potential revenue impact.

## Forecast view

Future operations may show confirmed/pending value, expected remaining
collections, open peak slots, and planned closures. This is an operating
forecast, not guaranteed revenue.

## Drill-down and export

Shared filters include date perspective/range, venue, resource, activity,
offering, status, payment method, source, actor, and customer/team.

Authorized CSV/spreadsheet-ready exports state filters, venue, generation time,
timezone, and currency. Customer and financial exports are permissioned and
audited.

## Access

- Booking Staff: assigned venue Today and shift data
- Manager: venue operations, utilization, customers, exceptions, basic expense
- Finance/Reports: payments, refunds, dues, expense, settlement, export
- Owner: authorized business-wide reports, comparisons, and audit

## Private-pilot reports

- Today summary
- Booking/status list
- Booking value and completed revenue
- Payments by method
- Refunds, reversals, dues
- Reserved occupancy
- Discounts/complimentary use
- Cancellations/no-shows
- Basic customer summary
- Staff action/audit
- CSV export

Deferred:

- Custom report builder
- Advanced cohorts and forecasting
- Scheduled delivery
- Accounting integrations
- Benchmarking
- AI recommendations
- Statutory statements

