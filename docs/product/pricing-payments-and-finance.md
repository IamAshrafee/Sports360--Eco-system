# Pricing, Payments, and Finance

Status: Confirmed

## Principle

```text
Pricing determines what is owed.
Payments show what was collected.
Refunds show what was returned.
Settlements show what reached the business.
```

These concepts must not be collapsed into one paid flag.

## Price resolution

```text
Offering default price
→ Recurring day/time rate
→ Specific-date override
→ Duration or quantity
→ Add-ons
→ Discount
→ Configured tax/service charge
= Final booking total
```

Priority:

```text
Specific-date rate > Recurring day/time rate > Default price
```

The private pilot favors explicit final scheduled rates instead of uncontrolled
percentage stacking.

## Pricing modes

### Fixed-slot pricing

Exact slots may have exact prices. This is the private-pilot mode.

### Flexible-duration pricing

Future offerings may define minimum, maximum, and duration increments. Rules
for bookings crossing rate periods must be explicit before implementation.

## Add-ons and discounts

Add-on lines preserve name, quantity, unit price, and booking-time total.

Manual discounts support fixed amount, percentage, or authorized complimentary
use. They require permission and reason. Coupons, membership benefits, and
package entitlements remain separate future concepts.

## Price snapshot

A booking preserves:

- Base and scheduled rate
- Add-ons
- Discount and reason
- Service/tax lines when configured
- Total
- Advance requirement
- Applicable policy

Configuration changes do not rewrite historical totals.

## Payment model

A booking may have multiple payments.

Each payment records:

- Booking
- Exact amount and currency
- Method and status
- Time
- Actor/collector
- Venue
- Provider or manual reference
- Verification and reconciliation status

Calculations:

```text
Net paid = Successful payments - Completed refunds
Balance due = Current booking total - Net paid
```

Use exact decimal or integer minor-unit money representation, never JavaScript
floating-point arithmetic.

## Payment methods

Business-configurable methods:

- Cash
- bKash
- Nagad
- Rocket
- Bank transfer
- Card/payment gateway
- Other manual method
- Venue credit later

Complimentary use is a price waiver, not a payment method.

## Manual mobile payment

Capture:

- Amount
- Transaction ID
- Sender phone suffix when useful
- Receiving account
- Payment time
- Verification status
- Optional evidence
- Verifying employee

A screenshot alone is not conclusive verification.

## Online gateway integration

Candidate providers must be evaluated at implementation time for onboarding,
commercial terms, supported channels, refunds, settlement, and technical
reliability.

Integration rules:

- Server-to-server verification
- Verified callback/webhook processing
- Idempotency
- Provider and internal references
- Safe retry and duplicate handling
- Encrypted credentials
- Reconciliation
- No storage of card or wallet secrets

## Recipient-of-funds decision

Initial strategy:

> Venue businesses receive their own booking revenue through their merchant
> arrangements where supported; the platform charges a separate SaaS
> subscription.

Platform collection followed by venue payouts is deferred because it adds
commission, settlement, refund-reserve, dispute, legal, tax, and operational
complexity.

## Payment attempts

An online attempt is separate from a successful payment:

```text
Initiated → Processing → Succeeded
                       ↘ Failed/Cancelled/Expired
```

Only verified success creates collected value.

## Refunds and reversals

Financial records are not silently deleted.

A refund preserves:

- Original payment
- Amount and method
- Reason
- Requested/approved/completed actors and times
- Provider reference
- Status

An incorrect manual payment is reversed with reason and authorization.

## Gateway fees and settlements

Example:

```text
Customer payment       ৳2,000
Processing fee            ৳50
Net settlement          ৳1,950
```

The customer still paid ৳2,000. Provider fees belong to settlement/expense
reporting and must not reduce the customer's recorded payment.

## Revenue and collection

Reports distinguish:

- Booking value
- Completed-service revenue
- Payments collected
- Refunds
- Outstanding dues
- Cancellation/no-show fees
- Gateway fees
- Net cash movement

An advance collected today for a future booking is cash collected today but not
necessarily completed-service revenue today.

## Daily reconciliation

```text
Opening cash
+ Cash payments
- Cash refunds
- Approved cash expenses
= Expected closing cash

Counted closing cash - Expected closing cash = Variance
```

Digital methods are summarized separately.

## Expenses

Basic future/pilot-late expense records include category, amount, date, venue,
method, vendor, description, receipt, submitter, and approval.

The product does not initially provide payroll, depreciation, balance sheets,
statutory filings, or audited accounting.

## Taxes and service charges

Rates and compliance must not be hardcoded without qualified Bangladesh
accounting and legal review. Architecture should permit inclusive/exclusive tax,
service charges, registration information, and receipt/invoice numbering.

## Private-pilot coverage

Included:

- BDT
- Fixed-slot scheduled prices and date overrides
- Add-ons and authorized manual discounts
- Multiple and partial payments
- Cash and manual mobile financial service records
- Dues, manual refunds, and reversals
- Daily method summary
- Audit history

Deferred:

- Automatic commissions/payouts
- Wallets and venue credit
- Loyalty, packages, memberships
- Split payments
- Multi-currency
- Full accounting and automated tax filing

