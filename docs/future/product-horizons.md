# Product Horizons

Status: Directional roadmap

The long-term product is one connected operating platform. Horizons describe
the order in which value is likely to become useful, not fixed release dates.

## H0: Private Pilot — trusted venue operations

Outcome:

> One Bangladesh venue can use the product as the primary source for fixed-slot
> bookings, customers, payments, daily operations, and owner reporting.

Core:

- One active venue with independent resources
- Staff and customer booking in one calendar
- Conflict-safe fixed slots
- Guest/returning customers
- Cash/manual MFS payments, dues, refunds
- Today workspace
- Core reports and audit
- Assisted onboarding and manual subscription

This is defined in [Private-Pilot MVP Scope](../product/pilot-mvp-scope.md).

## H1: Commercial Core — repeatable SaaS

Outcome:

> A venue can discover, purchase, configure, and operate the product with
> predictable support and production-grade online payment.

Candidate capabilities:

- Self-service onboarding and plan purchase
- Multiple active venues according to plan
- One production online-payment gateway
- Transactional SMS/notification provider
- Stronger Bangla localization
- Basic expense and settlement workflows
- Branch comparison
- Repeatable imports and onboarding support
- Automated subscription invoice reminders
- Public booking-page refinement and branded sharing
- Reusable basic teams if validated
- Commercial policies, privacy, security, support, and recovery readiness

Promotion criteria:

- H0 operations are reliable
- Several venues use the system as source of truth
- Onboarding can be repeated
- Pricing and willingness to pay have evidence
- Gateway and notification vendors are selected

## H2: Venue Growth Platform — deeper revenue and operations

Outcome:

> Venues use the platform not only to control bookings but also to retain
> customers, sell recurring products, operate complex spaces, and run organized
> sports programs.

Candidate capability groups:

### Booking depth

- Flexible durations
- Recurring reservations
- Composite/divisible resources
- Waiting lists
- Multi-resource/private event bookings

### Customer growth

- Memberships
- Prepaid packages
- Loyalty
- Venue credit
- Reusable teams and invitations
- Campaign coupons and off-peak offers

### Organized sports

- Tournaments and leagues
- Coaching sessions and classes
- Academies and attendance
- Corporate/private events

### Deeper operations

- Equipment inventory/rental
- Planned maintenance and work orders
- Staff scheduling and commissions
- Advanced customer/branch/resource reporting

Promotion criteria vary by capability and are described in the briefs.

## H3: Ecosystem and Enterprise — connected market

Outcome:

> The platform supports larger chains and an ecosystem connecting venues,
> players, partners, payments, software, and physical facilities.

Candidate capabilities:

- Discovery marketplace across businesses
- Platform commission and venue payouts
- Matchmaking, open games, and richer player/team profiles
- Public reviews with moderation
- APIs, webhooks, embeds, and partner integrations
- White-label/custom domains
- Enterprise hierarchy, custom roles, approvals, SSO
- Accounting/payroll integrations
- Full offline operating modes where justified
- IoT access, lighting, and occupancy
- Multi-language, multi-currency, regional tax/policy adapters
- Explainable forecasting, anomaly detection, and dynamic pricing assistance

H3 capabilities may materially change legal, support, security, and operational
responsibility. They require separate business cases.

## Architecture posture

The MVP should:

- Use tenant, venue, resource, offering, booking, payment, and entitlement
  boundaries that can grow.
- Store booking intervals and exact timestamps generically.
- Keep payment provider data behind a provider-neutral boundary.
- Preserve audit and event history.
- Use permission actions and scopes rather than one `isAdmin` flag.
- Treat notifications, integrations, and background jobs as replaceable
  adapters.
- Keep booking source extensible.

The MVP should not:

- Build empty tables and services for every H2/H3 feature.
- Add performance or UI complexity for unvalidated future cases.
- Promise marketplace, wallet, tax, or AI behavior without specialist review.

## Horizon review

Review horizons:

- After the founder-operated simulation
- After the first meaningful organic beta usage
- Before commercial v1 scope lock
- After five to ten beta venues
- When a capability is requested repeatedly with clear willingness to pay
- When a current design would block a strategically important future path
