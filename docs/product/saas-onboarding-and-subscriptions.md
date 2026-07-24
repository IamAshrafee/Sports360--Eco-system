# SaaS Onboarding and Subscriptions

Status: Confirmed

## Principle

> Help a venue reach its first real booking quickly, charge for business scale
> and value, keep subscription billing separate from venue revenue, and never
> destroy operational data because of a temporary billing problem.

## Registration and setup

```text
Verify owner phone
→ Create business
→ Create first venue
→ Add activities/resources/offerings
→ Configure hours, slots, prices, and policies
→ Invite staff
→ Create test booking
→ Preview and publish
```

Minimum first-booking setup:

- One venue
- One resource
- One offering
- One schedule
- One price

The setup wizard saves progress and shows a checklist.

## Draft and publish

New venues begin Draft. Publication checks active resource/offering, schedule,
price, contact, confirmation/payment policy, and cancellation terms. Owners
preview before public availability.

## Progressive verification

- Basic: verified owner phone and business/venue information
- Public listing: address/contact/media and platform review as required
- Online payment: provider-required merchant and legal information

Internal management should not be blocked merely because online-payment
verification is incomplete.

## Staff invitation

Invite by phone/email, assign access profile and venue scope, expire/revoke
unused invitations, and record the inviter. Access begins only after verified
acceptance.

## Subscription states

| State | Meaning |
|---|---|
| Trial/Pilot | Founder simulation or organic beta evaluation access |
| Active | Current authorized subscription |
| Past due | Invoice deadline passed |
| Grace | Temporary continued access |
| Restricted | Selected subscription actions disabled |
| Cancelled | Renewal ended or scheduled to end |
| Archived | Retained inactive tenant |

Subscription state is separate from venue operational state.

## Pilot and pricing strategy

Start with one complete pilot edition and founder-operated simulation, followed
by an optional self-service/invitation-link organic beta. Do not finalize public
pricing before behavioral and payment evidence.

Future plans may be Starter, Growth, and Custom/Enterprise, based mainly on
active venues, resources, staff, and advanced capabilities.

Avoid strict per-booking pricing initially because it may discourage complete
booking entry and make costs unpredictable.

## Entitlements

Central entitlement examples:

```text
feature.advanced_reports = enabled
limit.active_venues = 3
limit.active_staff = 15
```

Plan logic must not be scattered through application code.

Reaching a limit prevents new active items but does not delete historical or
existing data. Downgrades show affected items and take effect safely.

## Separate ledgers

```text
Venue subscription: Business → SaaS platform
Venue booking: Player/customer → Venue business
```

Invoices, payments, refunds, and reports remain separate.

## Subscription billing

Initial collection may use manual mobile financial service payment, bank
transfer, gateway invoice, or approved pilot credit.

Automatic recurring payment, complex proration, and many public tiers wait
until provider support and customer demand are validated.

Subscription invoices preserve platform/business information, billing period,
plan, discount, configured tax, total, due date, and payment reference.
Accounting/legal review is required before production invoice claims.

## Grace, restriction, and suspension

```text
Due → Past-due reminder → Grace → Restricted → Suspended
```

During grace, operations continue with owner/billing notices. Later restriction
may disable public booking or configuration before read-only suspension.
Existing customer obligations and confirmed bookings require a safe operating
window.

Suspension never deletes data and retains access to billing, recovery, permitted
export, support, and reactivation.

## Upgrade, downgrade, cancellation

- Upgrade may activate immediately; manual adjustment is acceptable in pilot.
- Downgrade normally occurs next period and never destroys records.
- Cancel renewal differs from temporary suspension, account closure, and data
  deletion.
- Owner can continue through paid period and understand retention/export.

Retention durations require a formal policy covering operational, financial,
audit, backup, anonymization, legal hold, and reactivation needs.

## Platform administration

Pilot platform administration supports:

- Business search
- Owner and subscription status
- Onboarding progress
- Entitlements and limits
- Manual payment/pilot adjustment
- Verification
- Safe restriction/reactivation
- Aggregate platform health
- Platform audit

Tenant customer data is not exposed by default.

## Support access

Future impersonation requires reason, consent or documented urgent policy,
time-limited session, visible support-mode banner, restricted sensitive
operations, strong authentication, and audit.

The pilot favors screenshots and read-only diagnostics over broad
impersonation.

## Public page

Each business may receive a platform-hosted branded booking page. Custom
subdomains/domains, embedded widgets, API access, and full white-label products
are deferred.

## Platform metrics

- Registered and activated businesses
- Time to first resource/booking
- Trial-to-paid conversion
- Active subscriptions, recurring revenue, churn
- Bookings processed and feature adoption
- Support demand and payment failures

These platform metrics remain separate from tenant reports.

## Private-pilot coverage

Included:

- OTP owner registration
- Guided first-venue setup
- Staff invitation
- Draft/published page
- Pilot/active/past-due/restricted/cancelled states
- Central entitlement foundation
- Manual subscription billing
- Safe suspension and audit
- Onboarding milestones

Deferred:

- Recurring billing/proration
- Many pricing tiers
- White label/custom domains
- Resellers
- Usage-based billing
- Enterprise SLA/contract management
- Automated marketplace commissions and payouts
