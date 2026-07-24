# Memberships, Teams, and Community

Status: Future capability brief
Likely horizon: H2–H3

## Purpose

These capabilities help venues retain customers and help players organize
repeated activity. Membership, package, loyalty, credit, team, and community
features remain distinct because they create different rights and liabilities.

## FC-201: Memberships

### Value

Creates a time-bound relationship that may grant benefits:

- Member pricing
- Early booking access
- Included amenities
- Priority waiting list
- Monthly benefits

### Representative workflow

```text
Choose membership plan
→ Verify eligibility
→ Pay/activate
→ Apply benefits during eligible booking
→ Renew, expire, pause, or cancel
```

### Core rules

- Membership belongs to one business unless explicitly platform-wide later.
- Plan versions and accepted terms are preserved.
- Benefits state exactly where, when, and to whom they apply.
- Renewal and cancellation do not rewrite historical bookings.
- Family, corporate, and academy memberships require separate ownership rules.
- A discount and an entitlement are not the same thing.

### Dependencies

- Customer account/relationship
- Subscription-like lifecycle
- Eligibility engine
- Benefit-aware pricing
- Recurring/manual payment

### MVP seam

Customer records and price calculation allow future contextual benefits without
hardcoding all customers to the public rate.

### Promotion trigger

Venues currently sell memberships or show willingness to introduce them with
measurable retention value.

## FC-202: Prepaid packages

### Value

Allows purchase of a defined entitlement:

- Ten badminton sessions
- Twenty off-peak hours
- Five coaching classes

### Representative workflow

```text
Purchase package
→ Create entitlement balance
→ Redeem against eligible booking
→ Reverse redemption on qualifying cancellation
→ Expire or renew
```

### Core rules

- Store original purchased quantity/value and remaining entitlement.
- Define eligible venues, offerings, times, and holders.
- Redemption is an auditable ledger, not a mutable counter only.
- Cancellation policy determines whether a unit returns.
- Expiry, transfer, sharing, and refund rules are explicit.
- Price changes do not alter already purchased entitlement.

### Dependencies

- Entitlement ledger
- Booking redemption
- Refund/cancellation connection
- Revenue/accounting review

### MVP seam

Keep booking price/payment separate so later non-cash redemption can be
represented without fake payment transactions.

### Promotion trigger

Repeated bookings and owner demand demonstrate that prepaid commitment would
improve cash flow or retention.

## FC-203: Loyalty

### Value

Rewards desired behavior such as completed off-peak bookings or referrals.

### Representative workflow

```text
Eligible event completes
→ Earn points/reward
→ Customer sees balance/expiry
→ Redeem against permitted benefit
→ Reverse on refund/fraud
```

### Core rules

- Use an immutable earning/redemption ledger.
- Earning is based on completed/eligible events, not merely initiated payment.
- Expiry and value are clearly disclosed.
- Manual adjustment requires permission and reason.
- Liability and tax/accounting impact require review.

### Dependencies

- Reliable completed booking and refund events
- Customer portal
- Reward catalogue
- Anti-abuse controls

### MVP seam

Publish stable domain events/audit signals for booking completion, cancellation,
and refund.

### Promotion trigger

Retention analysis identifies a meaningful repeat-booking opportunity and
venues are willing to fund rewards.

## FC-204: Venue credit

### Value

Lets a venue issue reusable value after cancellation, service failure, or manual
adjustment.

### Core rules

- Credit belongs to a specific business unless a platform liability model is
  deliberately adopted.
- Issuance, redemption, expiry, reversal, and transfer are ledger entries.
- Credit cannot be confused with cash collected.
- Refund-to-credit requires customer consent where applicable.
- Negative balance is normally prohibited.

### Dependencies

- Financial liability ledger
- Checkout redemption
- Expiry/refund policy
- Accounting/legal review

### MVP seam

Cancellation results can record an intended future credit outcome even while
the pilot executes only cash/manual refunds.

### Promotion trigger

Refund friction or rescheduling behavior demonstrates clear benefit and legal/
accounting treatment is understood.

## FC-205: Reusable teams

### Value

Reduces repeated organizer work and creates a stable group identity.

### Representative workflow

```text
Create team
→ Invite members
→ Assign organizer/co-organizer
→ Book on behalf of team
→ Share schedule and attendance
```

### Core rules

- Team ownership and organizer transfer are explicit.
- A member controls their own account and departure.
- Invitation may use phone/link without exposing the roster.
- Venue sees only information relevant to its bookings.
- Team history does not expose private venue/customer records.

### Dependencies

- Global user identity
- Invitation/notification
- Team membership and permissions
- Booking-party association

### MVP seam

Pilot bookings store optional team name and responsible contact separately from
the customer account.

### Promotion trigger

Organizers repeatedly book and request roster/invitation reuse.

## FC-206: Split payments

### Value

Allows organizers to collect participant contributions toward a booking.

### Representative workflow

```text
Organizer confirms booking/deposit
→ Creates payment shares or open contribution link
→ Participants pay
→ Booking balance updates
→ Organizer remains responsible under defined policy
```

### Core rules

- The venue's confirmation requirement is not dependent on every participant
  unless explicitly configured.
- Refunds map back to original payers/methods.
- Overpayment and unpaid shares have explicit handling.
- Participants cannot access unrelated booking/customer financial data.
- Gateway fees and payout responsibility must be defined.

### Dependencies

- Online gateway
- Multi-payer payment model
- Identity/invitation
- Complex refund allocation

### MVP seam

Payments already support multiple transactions and payer context can be added
without changing booking totals.

### Promotion trigger

Team organizers identify collection as a frequent, high-friction problem and
gateway economics support it.

## FC-207: Open games and matchmaking

### Value

Fills incomplete teams and unused capacity by allowing players to join games.

### Representative workflow

```text
Organizer marks game open
→ Defines sport, level, positions, fee, rules
→ Players request/join
→ Organizer or automatic policy accepts
→ Participant payment/attendance
```

### Core rules

- Safety, moderation, eligibility, and cancellation policy are explicit.
- Privacy controls limit phone/contact exposure.
- Player skill and position are self-declared or transparently sourced.
- A venue booking and an open game have separate lifecycles.
- Organizer and platform responsibilities are clearly stated.

### Dependencies

- Teams/participants
- Marketplace discovery
- Moderation/reporting
- Split payment or organizer collection
- Notification

### MVP seam

Do not equate a booking customer with all participants. Keep participant
features optional.

### Promotion trigger

Organic marketplace behavior demonstrates enough liquidity in specific
cities/sports.

## FC-208: Ratings and reputation

### Value

Can improve discovery and accountability, but creates fairness, moderation, and
privacy risk.

### Core rules

- Only verified completed interactions may review.
- Separate venue reviews from player/organizer behavior.
- Provide moderation, appeals, anti-retaliation, and abuse detection.
- Never expose one business's private notes as public reputation.
- Explain how scores are calculated.

### Dependencies

- Sufficient transaction volume
- Marketplace
- Moderation operations
- Terms/privacy/legal review

### MVP seam

Preserve factual booking outcomes while avoiding an opaque customer score.

### Promotion trigger

Discovery marketplace has enough volume that trust cannot be handled through
venue verification and factual listing information alone.
