# Reporting, Subscription, and Platform Workflows

Status: Approved behavioral baseline

## WF-RPT-001: Review owner Today and drill down

Priority: P0
Primary actor: Business Owner or Manager
Scenarios: RPT-001 through RPT-010

### Main path

1. Actor opens dashboard for authorized business/venue/date.
2. System states timezone, operational date, date perspective, and refresh time.
3. Actor reviews bookings, booking value, collections, due, occupancy, blocks,
   cancellations/no-shows, discounts/refunds, and alerts.
4. Actor selects a metric.
5. System opens filtered source records producing the total.
6. Actor changes authorized filters without losing metric definitions.

### Rules

- Booking-created, service, transaction, refund, and operational dates are
  explicit.
- Pending future booking is not completed revenue.
- Reserved occupancy and played utilization remain distinct.
- No-show affects them differently.
- Blocked resource time reduces available capacity.

## WF-RPT-002: Review finance, dues, and exceptions

Priority: P0
Primary actor: Finance/Reports or Owner
Scenarios: RPT-002 through RPT-004, RPT-009, RPT-011, PAY-012

### Main path

1. Actor selects transaction/service date perspective and authorized scope.
2. System shows successful payments by method, refunds, reversals, due at
   arrival, overdue balances, discounts, complimentary use, and cash variance.
3. Actor drills into source booking/payment/refund.
4. Authorized actor exports current filtered data.
5. Export states filters, timezone, currency, creator, and generation time.

### Exceptions

- Booking Staff attempts sensitive export: deny.
- Data changed during export: report uses a consistent defined snapshot/strategy
  selected in architecture.

## WF-SUB-001: Manage pilot subscription lifecycle

Priority: P0
Primary actors: Business Owner, Platform Administrator, System
Scenarios: SUB-003 through SUB-009

### Main lifecycle

```text
Pilot/Trial → Active → Past due → Grace → Restricted → Cancelled/Archived
```

1. Platform Admin grants pilot/active entitlement with period and reason.
2. Owner sees plan, limits, invoice/payment state, and next action.
3. System warns before/after due date.
4. Grace preserves defined operations.
5. Restriction disables only documented actions and preserves data.
6. Payment/manual approval reactivates idempotently.

### Limit/downgrade rules

- Existing records are not deleted.
- New active items beyond limit are blocked clearly.
- Downgrade identifies over-limit configuration and lets owner resolve it.
- SaaS invoice/payment is never mixed with player booking money.

## WF-PLT-001: Administer tenant safely

Priority: P0
Primary actor: Platform Administrator
Scenarios: AUTH-009, SUB-004 through SUB-007

### Main path

1. Administrator searches business/owner metadata.
2. Administrator reviews onboarding, subscription, entitlements, verification,
   and platform health visible by policy.
3. Administrator performs permitted adjustment/restriction/reactivation with
   reason and effective period.
4. System audits the platform actor and target tenant.

### Rules

- Customer/booking detail is not exposed by default.
- No password or payment secret is visible.
- Full impersonation is outside pilot.
- Tenant data mutation requires explicit supported administrative action.
- Restriction/reactivation is reversible and data-preserving.

