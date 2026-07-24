# Commerce, Marketplace, and Finance

Status: Future capability brief
Likely horizon: H1–H3

## Purpose

The pilot records venue commerce. Later capabilities may automate online
collection, stimulate demand, distribute venues through a marketplace, and
connect financial systems. Each step increases platform responsibility.

## FC-401: Production online payment

### Value

Provides instant verified confirmation and reduces manual MFS checking.

### Representative workflow

```text
Create payment attempt
→ Redirect/embedded provider experience
→ Provider processes
→ Server verifies result
→ Idempotently record payment
→ Confirm booking
→ Reconcile settlement/refund
```

### Core rules

- Browser return is not proof of success.
- Callback/webhook and verification are idempotent.
- Booking hold expiry and late success have explicit resolution.
- Provider fee does not reduce customer-paid amount.
- Refund maps to original payment.
- Credential and merchant ownership are tenant-safe.

### Dependencies

- Provider selection and merchant onboarding
- Payment attempt/state model
- Webhook security
- Reconciliation
- Operational support for disputes/failures

### MVP seam

Provider-neutral payment records, external references, idempotency, and separate
attempt/payment/settlement concepts.

### Promotion trigger

Core booking is stable and selected pilot venues are merchant-ready.

## FC-402: Coupons and campaigns

### Value

Helps venues fill off-peak capacity, acquire customers, and measure promotions.

### Representative workflow

```text
Define campaign and eligibility
→ Publish/distribute code or automatic offer
→ Validate during checkout
→ Snapshot discount
→ Measure completed revenue and cost
```

### Core rules

- Validity, venue/resource/offering/time eligibility
- Per-customer and global limits
- Minimum spend and maximum discount
- Stackability policy
- Completed use versus abandoned attempt
- Refund and cancellation effect on usage count
- Manual adjustment and abuse audit

### Dependencies

- Customer identity
- Price engine
- Campaign analytics
- Optional marketplace

### MVP seam

Discounts are independent snapshot lines with reason/source.

### Promotion trigger

Utilization data reveals a targeted demand problem and venues are willing to
fund measurable offers.

## FC-403: Discovery marketplace

### Value

Lets players search across businesses by sport, area, time, price, amenities,
and verified availability.

### Representative workflow

```text
Search/filter
→ Compare venue/resource/offering
→ View trustworthy availability and policies
→ Book/pay
→ Receive confirmation
```

### Core rules

- Listing and operational tenant data are separated.
- Businesses control publication of eligible offerings.
- Ranking factors and sponsored placement are disclosed.
- Availability comes from the same source used by venue staff.
- Verification, photo/content moderation, closure, and dispute processes exist.
- Marketplace source attribution is preserved.

### Dependencies

- Sufficient active venue supply and customer demand
- Public listings/search/geolocation
- Reliable venue operations
- Content moderation/support
- Online payment or clear confirmation policy

### MVP seam

Public booking page, extensible source channel, publish state, and normalized
activity/location metadata.

### Promotion trigger

Enough reliable supply exists in a concentrated city/sport market to produce
useful search liquidity.

## FC-404: Platform commission and venue payout

### Value

Enables transaction-based marketplace monetization and centralized checkout.

### Representative workflow

```text
Customer pays platform/approved arrangement
→ Allocate gross, fee, tax, reserve, venue payable
→ Hold until settlement condition
→ Pay venue
→ Handle refund/dispute/negative adjustment
```

### Core rules

- Merchant-of-record and legal roles are explicit.
- Every movement uses double-entry-like ledger discipline.
- Commission plan and tax treatment are versioned.
- Refunds after payout create reserve or negative balance policy.
- Payout status, bank/MFS destination, failure, retry, and reconciliation exist.
- Venue receives transparent statements.
- Platform and venue funds are not mixed casually.

### Dependencies

- Legal/tax/payment-provider review
- Sub-merchant/onboarding capability
- Financial ledger
- Payout/settlement/reconciliation
- Fraud/dispute/support operations

### MVP seam

Keep venue booking payments separate from SaaS subscription payments and retain
provider-neutral transaction references.

### Promotion trigger

Marketplace demand and unit economics justify the additional regulated and
operational responsibility.

## FC-405: Venue credit and gift value

Venue credit is covered in the customer-growth brief. Gift cards/vouchers add:

- Purchaser and beneficiary
- Issuance and redemption ledger
- Expiry and refund rules
- Fraud/transfer controls
- Financial-liability reporting

Promotion requires accounting/legal review and sufficient customer demand.

## FC-406: Automated subscription billing

### Value

Makes SaaS collection repeatable at scale.

### Representative workflow

```text
Generate renewal invoice
→ Collect or notify
→ Retry/remind
→ Grace/restrict
→ Reactivate or cancel
```

### Core rules

- Explicit billing period and plan version
- Proration and credit-note rules
- Failed payment and retry schedule
- Owner notification and grace
- Safe downgrade and data preservation
- Manual administrative adjustments remain audited

### Dependencies

- Validated plans/prices
- Gateway/provider capability
- Invoice and tax review
- Entitlement enforcement

### MVP seam

Subscription ledger/state is separate from tenant booking commerce.

### Promotion trigger

Manual subscription administration becomes repetitive and commercial pricing
is stable.

## FC-407: Accounting and finance integrations

### Value

Exports or synchronizes trustworthy operational transactions to the business's
accounting process.

### Possible scope

- Chart-of-account mapping
- Sales/payment/refund/fee/expense journal export
- Settlement matching
- Invoice/receipt export
- Accounts receivable
- Bank reconciliation

### Core rules

- Source transaction and external posting are linked.
- Sync is idempotent and correction uses reversal, not deletion.
- Operational reports remain distinguishable from statutory accounts.
- Configuration belongs to qualified finance users.
- Provider-specific mappings are versioned.

### Dependencies

- Stable internal financial events
- Selected accounting targets
- Accountant review
- Integration monitoring

### MVP seam

Exact immutable financial records, explicit dates, and export identifiers.

### Promotion trigger

Larger venues repeatedly re-enter the same data and a common accounting target
emerges.

## Shared financial safety

Future commerce features require:

- Exact money and currency
- Idempotent events
- Immutable ledger/audit patterns
- Reconciliation
- Permission and approval
- Clear legal entity and recipient of funds
- Data retention and dispute operations

No marketplace or wallet feature should be promoted only because the UI appears
simple.
