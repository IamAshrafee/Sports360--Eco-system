# Booking Lifecycle

Status: Confirmed

## Principle

Every booking channel uses one availability engine. Booking state, payment
state, and attendance state remain separate.

## State areas

### Booking state

| State | Meaning |
|---|---|
| Pending | Awaiting payment, verification, or approval |
| Confirmed | Resource and time are securely reserved |
| Cancelled | Cancelled by customer, venue, or authorized staff |
| Expired | Required action was not completed by the deadline |
| Completed | Service was fulfilled |
| No-show | Customer did not attend |

### Payment state

| State | Meaning |
|---|---|
| Unpaid | Nothing collected |
| Partially paid | Some money collected |
| Paid | Full current total collected |
| Partially refunded | Part of collected money returned |
| Refunded | All collected money returned |
| Failed | A payment attempt failed |

Valid combinations include Confirmed + Partially paid, Cancelled + Refunded,
and No-show + Paid.

### Attendance state

```text
Expected → Checked in → In progress → Finished
```

The interface may derive a friendly summary, but the underlying concerns stay
separate.

## Booking sources

- Customer booking page
- Staff dashboard
- Phone
- Messenger
- WhatsApp
- Walk-in
- External marketplace/API later
- Imported/migrated

Record both the source channel and the actor who created the booking.

## Online flow

```text
Select venue/activity/offering
→ Select date and slot
→ Revalidate availability
→ Create temporary hold
→ Capture customer/contact
→ Calculate and snapshot price/policy
→ Satisfy confirmation requirement
→ Confirm booking
→ Send confirmation
```

Temporary holds:

- Have an explicit expiry
- Reserve availability during checkout
- Are not revenue or completed bookings
- Release automatically
- Are visible to authorized staff

## Staff-assisted flow

```text
Open calendar
→ Select available slot
→ Search/create customer
→ Select source
→ Enter payment or advance
→ Confirm
→ Share confirmation
```

Staff may create a pending reservation with a payment deadline. Expiration
releases the slot unless authorized staff extend or confirm it.

## Confirmation policies

Offerings may support:

- No advance; pay at venue
- Fixed advance
- Percentage advance
- Full payment
- Manual approval later where validated

The booking stores the policy accepted at creation.

## Conflict prevention

Conflict checks run on the server and database. They consider:

- Same resource
- Overlapping interval
- Active holds
- Pending reservations that reserve capacity
- Confirmed bookings
- Blocks and closures
- Related composite resources later

Intervals use `[start, end)`, allowing valid back-to-back bookings.

Availability is revalidated at final confirmation. Frontend availability is
never sufficient proof.

## Booking snapshot

Preserve:

- Resource, offering, start, and end
- Customer/contact data used
- Price lines and discounts
- Advance requirement
- Cancellation and rescheduling terms
- Booking source
- Human-readable reference

Later changes to customer profiles, resources, or price configuration must not
make history unintelligible.

## Check-in and completion

```text
Find booking
→ Confirm contact/reference
→ Review and collect due
→ Confirm add-ons
→ Check in
→ Mark in progress
→ Finish
```

Outstanding payment may warn or block check-in according to business policy.
Authorized exceptions require a reason.

## Late arrival and extension

Late arrival does not automatically change the original end time.

An extension:

- Rechecks availability
- Calculates extra price
- Records payment or due
- Preserves change history
- Cannot overlap a following booking or block

## Rescheduling

Rescheduling:

- Checks new availability
- Recalculates price
- Calculates extra due or credit
- Preserves the original schedule
- Records actor and reason
- Notifies the customer

It is not an invisible delete-and-recreate operation.

## Cancellation

Record:

- Cancelling party
- Time and reason
- Accepted policy
- Fee retained
- Refund or credit result
- Approving actor for exceptions

Customer and venue cancellations are reported separately. Venue cancellation
may lead to rescheduling, replacement resource, refund, or future credit.

## No-show

After the configured grace period, authorized staff may mark no-show and record:

- Contact attempt
- Amount paid and retained
- Remaining due or waiver
- Policy result

The private pilot records facts; it does not impose an automatic cross-business
penalty.

## Refunds and overrides

A cancellation and a refund are separate events. Refunds reference original
payments and preserve method, amount, reason, actor, and status.

Sensitive overrides require permission and audit history. A physically
impossible scheduling collision is not a normal override.

## Private-pilot coverage

Included:

- Staff and online bookings
- Fixed slots
- Holds and pending expiry
- Advance/full/pay-later confirmation
- Check-in through completion
- Rescheduling, cancellation, refund record, expiration, no-show
- Price/policy snapshots
- Conflict prevention and audit history

Deferred:

- Recurring series
- Split payments
- Waiting lists
- Tournaments
- Composite resources
- Venue credit
- Automatic penalties

