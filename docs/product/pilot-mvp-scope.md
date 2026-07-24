# Private-Pilot MVP Scope

Status: Confirmed

## Definition

> A secure, mobile-responsive, multi-tenant web application that allows a
> one-location Bangladeshi sports venue to configure fixed-slot resources,
> centrally manage staff-assisted and online bookings, prevent scheduling
> conflicts, track customers and payments, operate from a Today workspace, and
> review trustworthy reports.

## Pilot customer

- One active venue
- Approximately 2–10 independent resources
- Fixed-duration slots
- BDT and `Asia/Dhaka`
- Owner, manager, staff, and optional finance access
- Cash and manual bKash/Nagad
- Phone, message, walk-in, and online bookings
- Assisted onboarding

The architecture remains multi-venue even while the pilot limits each business
to one active venue.

## Required outcomes

1. Owner configures venue, resources, offerings, schedule, prices, and policy.
2. Staff record every booking channel in one calendar.
3. Customer can select and request/book a live available slot.
4. Concurrent actions cannot double-book an independent resource.
5. Staff track advance, partial payment, due, refund, and reversal.
6. Staff operate arrivals through completion from Today.
7. Owner can trace booking, collection, discount, refund, due, and utilization.
8. Platform administrator can onboard and safely manage pilot tenants.

## Included modules

### Foundation

- Tenant isolation
- Phone/OTP identity
- Fixed access profiles and venue scope
- Audit history
- Platform administration

### Venue configuration

- Business and one active venue
- Activities, independent resources, offerings
- Fixed slots and schedule inheritance
- Scheduled/special-date rates
- Amenities and simple add-ons
- Blocks

### Booking

- Staff, phone, message, walk-in, and public-page source
- Holds and pending expiry
- Confirmed lifecycle
- Check-in/in-progress/completed
- Reschedule, cancel, no-show
- Conflict-free extension and reassignment
- Price/policy snapshots

### Customer

- Guest and optional registered profiles
- Phone normalization/OTP
- Returning search
- Individual/team/organization contact
- History, notes, tags, restrictions, duplicate warning

### Finance

- Cash and manual mobile payment
- Multiple/partial payments
- Dues
- Manual refund/reversal
- Discount reason and access control
- Daily method summary

### Operations and reports

- Today timeline/list/search
- Walk-in and arrival workflow
- Blocks/basic issue notes
- Alerts/handover
- Owner Today summary
- Booking, collection, due, exception, occupancy, customer, and audit reports
- CSV export

### SaaS

- Assisted onboarding
- Draft/published page
- Staff invitation
- Pilot/subscription states
- Entitlement foundation
- Manual subscription record

## Intentionally manual

- Venue onboarding and initial data setup
- Business/payment verification
- Subscription invoicing and verification
- Manual mobile-payment verification
- Refund execution followed by system record
- Initial booking import
- Confirmation-link sharing
- Support troubleshooting

Manual work is acceptable only when the system records the resulting state.

## Explicitly deferred

- Native mobile apps
- Full offline booking
- Multiple active pilot venues
- Composite/divisible resources
- Flexible and recurring bookings
- Tournaments, leagues, waiting lists
- Full teams, matchmaking, ratings, split payment
- Membership, packages, loyalty, wallet/credit
- Advanced coupons/dynamic pricing
- Full equipment inventory and maintenance
- HR, payroll, biometric attendance
- Full accounting and tax filing
- Marketplace collection, commissions, and payouts
- Public discovery marketplace
- Custom roles, white label, custom domain
- Custom reports, AI analytics, multi-currency

Deferred capabilities are not unknown. Their product intent, workflows, rules,
dependencies, and MVP seams are described in the
[Future Product Blueprint](../future/README.md). Those briefs do not add them to
the pilot.

## Minimum security

- Server-side tenant/role/venue authorization
- OTP and authentication rate limits
- Secure sessions and network transport
- Secret protection
- Exact money arithmetic
- Idempotent booking/payment operations
- Audit of sensitive actions
- Restricted exports
- No sensitive data in logs
- Backups and tested restore
- Dependency/security monitoring

## Minimum reliability

Verify:

- Concurrent conflict protection
- Hold expiration and safe retry
- Back-to-back interval behavior
- Reschedule/extension conflict checks
- Exact payment/refund totals
- Idempotent callbacks
- Timezone and after-midnight behavior
- Report reconciliation
- Cross-tenant and cross-venue isolation
- Notification failure does not undo booking
- Background-job retry safety

## Rollout

1. Public evidence and competitor-flow research
2. Six synthetic venue archetypes
3. Founder-operated internal simulation
4. Safe self-service/invitation-link organic beta
5. Evidence-led commercial v1

The active plan does not require direct venue-owner/staff outreach, interviews,
or a recruited design partner. If an organic user adopts the product, the
software should become that venue's primary booking record; two independent
authoritative calendars remain unsafe.

## Working success targets

- Scripted standard booking can be completed in under one minute
- No system-created double booking
- Collection reports reconcile with source records
- Every documented scenario has acceptance coverage
- Self-service onboarding completes without direct founder configuration
- Organic users return and record meaningful activity
- Paid continuation later demonstrates credible willingness to pay
- Support demand remains manageable for one developer

## Warning signs

- Organic users abandon setup or core workflows
- Users report that reports do not match their records
- Every venue requires custom code
- Booking takes longer than the current method
- Reconciliation frequently differs
- Users need constant developer assistance
- Public booking creates more manual work
- Usage interest does not convert into continued or paid behavior

## Development order

1. Identity, tenancy, access, and audit
2. Business/venue/resource/offering configuration
3. Schedule, price, and availability engine
4. Staff booking and conflict prevention
5. Customer and booking lifecycle
6. Payments, dues, refunds, reversals
7. Today operations
8. Core reporting/reconciliation
9. Public booking, OTP, and holds
10. Notifications and confirmations
11. Pilot subscription/entitlement administration
12. Security, monitoring, backup/restore hardening
13. Founder-operated simulation and organic beta readiness

Staff-side source-of-truth operations precede marketplace/discovery work.
