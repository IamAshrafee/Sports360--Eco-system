# Market and Ideal Customer

Status: Confirmed customer hypothesis; operational details remain unvalidated

## Initial market

Bangladesh is the launch market. Product defaults should reflect:

- Currency: BDT
- Timezone: `Asia/Dhaka`
- Mobile-first operation
- Phone-number-centered customer lookup
- Cash and mobile financial service payments
- Phone, social-message, and walk-in booking channels
- English initially with localization architecture prepared for Bangla

The product should not assume that all bookings originate from a customer app.

## Ideal customer profile

The first paying customer is:

> A privately owned, owner-operated sports venue in an urban or developing area
> of Bangladesh, with one active location, several daily bookings, and a manual
> booking process that has become difficult to control.

Preferred private-pilot characteristics:

- One venue
- Approximately 2–10 independently bookable resources
- Fixed-duration slots
- Owner plus a small operating team
- Evening and weekend demand
- Peak and off-peak prices
- Cash and bKash/Nagad collection
- Bookings received through calls, messages, walk-ins, and online channels
- An owner who wants visibility without being physically present

A high-volume single-resource venue may also qualify. Operational pain and
willingness to change matter more than resource count.

## Example venue

A representative detailed venue archetype could operate:

- Two football turfs
- Three badminton courts
- One receptionist
- One venue manager
- Several support employees
- Fixed slots with higher evening and weekend rates
- Returning teams plus occasional new customers

This is complex enough to benefit from software without enterprise procurement
or stadium-specific requirements.

## Likely current workflow

This remains a validation hypothesis:

1. Customer calls or messages to ask for a date and time.
2. Staff check a notebook, spreadsheet, whiteboard, or previous conversation.
3. Staff reply with availability and price.
4. Customer selects a slot.
5. Staff request an advance or accept a verbal reservation.
6. Customer sends a mobile-payment reference or screenshot.
7. Staff record the booking manually.
8. Remaining money is collected at the venue.
9. Staff summarize cash, mobile payments, refunds, and dues.
10. Owner receives a manual report or calls the manager.

## Pain hypotheses

### Owner

- Cannot see accurate real-time bookings remotely
- Cannot reliably reconcile collected money with bookings
- Has limited visibility into unauthorized discounts or leakage
- Cannot measure occupancy, customer retention, or resource performance
- Depends on employees and disconnected records

### Manager and booking staff

- Repeated availability questions
- Pressure during busy periods
- Rescheduling and cancellation confusion
- Unclear payment verification
- Difficulty handing work to another employee
- Risk of arguments when records are incomplete

### Player or organizer

- Must contact several venues
- Waits for confirmation
- Cannot trust live availability
- Faces unclear cancellation and refund rules
- Lacks a consistent receipt and booking history

## Customer qualification

A strong pilot business:

- Feels measurable booking or reconciliation pain
- Agrees to make the software its primary booking record
- Can nominate an owner/manager decision-maker
- Can train staff and provide feedback
- Has enough upcoming bookings to test real workflows
- Accepts that some pilot processes remain manual

A weak pilot business:

- Has very low booking volume
- Wants only a marketplace listing
- Refuses to enter phone or walk-in bookings
- Requires extensive custom development before testing
- Cannot assign anyone responsible for adoption

## Market positioning

Current local products and emerging platforms demonstrate interest in venue
discovery, real-time availability, payments, and owner dashboards. This supports
the problem hypothesis but also means that a generic turf-booking marketplace
is insufficient differentiation.

The sharper position is:

> Complete venue operations first; public booking and marketplace distribution
> are connected growth channels.

See [market observations](../research/market-observations.md) for source notes.

## Evidence required

Before commercial confidence, public research and later organic usage should
test:

- Actual booking volumes and channel mix
- Current record-keeping methods
- Frequency and cost of booking errors
- Advance and cancellation practices
- Staff technology comfort
- Owner reporting priorities
- Willingness to pay and preferred billing period
- Required Bangla-language coverage
- Preferred notification channel
- Gateway and merchant-account readiness

The active roadmap does not require direct owner/staff interviews. These claims
remain assumptions until organic behavior supports them.
