# Competitor and Public Booking Flow Analysis

Status: Phase 1 desk analysis
Last reviewed: 2026-07-24

This document maps only publicly accessible flows and claims. It does not imply
access to private dashboards or confirm product quality.

## Comparison

| Product/page | Customer path | Owner/operations path | Commercial signal |
|---|---|---|---|
| TurfBook | Public page → date/slot/package/tournament → OTP/hold → payment details | Configure facility/resources/slots/rates → direct/online bookings → payments/dues → reports | Per-booking/prepaid platform fee claims |
| TurfLet | Sign up → search/map → venue/field → live calendar → gateway payment → booking/history/reward | Register/verify → list fields/prices → manage every channel → analytics/revenue/payout | Operations, optional marketplace/automation; retrieved pricing presentations varied |
| Turfly | App/signup → browse availability → select → pay → confirmation | Join network → centralized venue management and growth claims | Marketplace/ecosystem positioning |
| BookMyBattle | Location filter → venue/format/average price → detail → availability/payment claim | Owner schedule, revenue, communication claims | Marketplace/discovery positioning |
| Prime Arena | Venue-direct date → duration → start time/rate → full/30% advance → WhatsApp fallback | Not publicly mapped | Direct venue-owned booking |
| GAME ON | Location/sport/date → branch → pricing/availability → booking | Not publicly mapped | Multi-location venue brand |

## TurfBook

Source: [TurfBook](https://turfbook.vip/)

### Public customer flow

```text
Venue public page
→ Slot/session/package/tournament
→ Bangladesh mobile OTP
→ Visible hold timer
→ Customer details
→ bKash/Nagad payment information
→ Operator confirmation/follow-up
```

### Operator flow claimed publicly

```text
Create facility
→ Add resources, slots/sessions, rates, minimum payment, accessories, blocks
→ Receive public or direct booking
→ Verify/record payment and due
→ Manage booking/accessory/status
→ Review collection and reports
```

### Product lessons

- OTP does not require full account creation first.
- Public and direct bookings belong in one system.
- Payment verification and correction are first-class.
- Collections are grouped by method and linked to bookings.
- Blocking dates/resources is operational, not a deletion.
- Packages/tournaments/expenses are future-adjacent but not MVP requirements.

## TurfLet

Sources:

- [Player/product page](https://www.turflet.app/)
- [Owner page](https://www.turflet.app/for-owners)
- [About](https://www.turflet.app/about)

### Player flow claimed publicly

```text
Sign up
→ Search by location/price/amenity
→ Select venue/field
→ View live calendar and price
→ Pay through gateway
→ Receive/manage booking
→ Loyalty/review later
```

### Owner flow claimed publicly

```text
Register and verify
→ List venues/fields/photos/price rules
→ Operate online, phone, social, and walk-in booking
→ Track Today, occupancy, revenue, staff, and payout
→ Enable optional marketplace/automation
```

### Product lessons

- Operations and marketplace can be modular.
- Venue verification becomes relevant before marketplace publication/payment.
- Owner value is described through Today, occupancy, money, and fewer tools.
- Public pricing claims should not determine our model without behavioral
  evidence.

## Turfly

Source: [Turfly](https://www.turfly.com.bd/)

### Player flow claimed publicly

```text
Download/signup
→ Find venue and availability
→ Select slot
→ Secure payment
→ Confirmation
```

The public product also promotes split payment, teams, rankings, tournaments,
smart pricing, tickets, and sports-item marketplace.

### Product lessons

- The Bangladesh category is already expanding beyond booking.
- Community features require liquidity and moderation.
- Our future blueprint is justified, but venue-source-of-truth reliability
  remains the immediate differentiator.

## BookMyBattle

Sources:

- [Venue search](https://www.bookmybattle.com/turfs)
- [About](https://www.bookmybattle.com/about-us)

### Public flow

```text
Select division/district/area
→ Compare venue, field format, and average hourly price
→ Open venue detail
→ Select availability and secure payment (claimed)
→ Confirmation/history
```

### Product lessons

- Location hierarchy and field format matter in discovery.
- Average price is useful for comparison but actual slot price remains required.
- A marketplace card does not replace the operator's commercial snapshot.

## Venue-direct flow: Prime Arena

Source: [Prime Arena booking](https://primearenabd.com/book)

```text
Select date
→ Select duration
→ Select time-band slot
→ Review dynamic price
→ Choose full or 30% advance
→ Complete online or continue through WhatsApp fallback
```

### Product lessons

- Venue-owned public page is valuable even without a marketplace.
- Manual fallback and online availability can coexist.
- One offering may allow adjacent multi-hour selection.
- Late-night dates require explicit operational semantics.

## Our intended distinction

Our H0/H1 focus is:

```text
Venue source of truth
→ Staff speed and exception control
→ Exact payment/due/refund history
→ Today operations
→ Traceable owner reporting
→ Public booking from the same availability
```

Marketplace discovery, teams, loyalty, tournaments, dynamic pricing, WhatsApp
automation, and payouts remain documented future capabilities.

## Avoided copying

We should not copy:

- Competitor terminology without comprehension testing
- Claims about booking speed, growth, or revenue
- Pricing/commission structures without unit economics
- Feature volume as a product strategy
- UI layouts or proprietary content

We should reuse only domain truths independently supported by evidence and our
product principles.
