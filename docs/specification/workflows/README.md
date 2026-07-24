# MVP Workflow Catalogue

Status: Approved behavioral baseline

## Workflow groups

- [Identity, onboarding, and venue setup](identity-onboarding-and-setup.md)
- [Staff and public booking](booking-and-customer-workflows.md)
- [Payments, refunds, and reconciliation](payment-and-reconciliation-workflows.md)
- [Today operations and exceptions](today-operations-workflows.md)
- [Reporting, subscription, and platform administration](reporting-subscription-and-platform-workflows.md)

## Workflow inventory

| ID | Workflow | Primary actor | Priority |
|---|---|---|---|
| WF-IAM-001 | Register owner and create business | Business Owner | P0 |
| WF-IAM-002 | Invite and activate employee | Business Owner | P0 |
| WF-CFG-001 | Configure first venue for internal booking | Business Owner | P0 |
| WF-CFG-002 | Preview and publish public booking | Business Owner | P0 |
| WF-BKG-001 | Create staff-assisted booking | Booking Staff | P0 |
| WF-PUB-001 | Create public customer booking | Guest/Customer | P0 |
| WF-BKG-002 | Pending booking and payment deadline | Staff/System | P0 |
| WF-BKG-003 | Reschedule booking | Staff/Manager | P0 |
| WF-BKG-004 | Cancel booking | Customer/Staff/Manager | P0 |
| WF-CUS-001 | Find/create/merge customer | Staff/Manager | P1 |
| WF-CUS-002 | Create team/organization booking | Staff/Organizer | P1 |
| WF-PAY-001 | Record advance/partial/full payment | Booking Staff | P0 |
| WF-PAY-002 | Verify manual MFS payment | Staff/Manager | P0 |
| WF-PAY-003 | Reverse incorrect payment | Manager/Finance | P0 |
| WF-PAY-004 | Record refund | Manager/Finance | P0 |
| WF-PAY-005 | Reconcile shift/day cash | Staff/Finance | P0 |
| WF-OPS-001 | Operate arrivals through completion | Booking Staff | P0 |
| WF-OPS-002 | Handle walk-in | Booking Staff | P1 |
| WF-OPS-003 | Handle late arrival, no-show, and extension | Staff/Manager | P1 |
| WF-OPS-004 | Block resource and resolve affected bookings | Manager | P0 |
| WF-OPS-005 | Reassign resource | Manager | P1 |
| WF-OPS-006 | Shift handover and close | Booking Staff | P1 |
| WF-RPT-001 | Review owner Today and drill down | Owner/Manager | P0 |
| WF-RPT-002 | Review finance, dues, and exceptions | Finance/Owner | P0 |
| WF-SUB-001 | Manage pilot subscription lifecycle | Owner/Platform Admin | P0 |
| WF-PLT-001 | Administer tenant safely | Platform Administrator | P0 |

## Shared behavior

- All operational actions are tenant- and venue-scoped.
- Every booking mutation rechecks relevant invariants.
- Booking, payment, and attendance states are not inferred from each other.
- Money totals use exact arithmetic and source transactions.
- Sensitive action requires permission and audit.
- Customer notification failure never rolls back a valid booking/payment.
- Historical commercial and contact snapshots remain understandable.

