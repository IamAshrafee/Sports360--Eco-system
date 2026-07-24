# V-01: Single High-Volume Football Turf

Status: Synthetic archetype
Purpose: Prove that the product remains valuable and fast for a simple venue

## Business profile

**Synthetic name:** KickPoint Turf
**Location type:** Dense Dhaka neighborhood
**Business shape:** One venue, one independently bookable turf
**Primary activity:** 5-a-side football
**Operating hours:** 06:00–01:00 daily
**Operational-day cutoff:** 03:00

This archetype prevents the system from assuming that valuable customers must
operate many resources. Its pressure is booking speed, evening demand, team
organizers, and advance collection.

## People

| Person | Access |
|---|---|
| Owner | Entire business, subscription, reports |
| Day Booking Staff | Venue bookings and collections |
| Evening Booking Staff | Venue bookings and collections |
| Finance helper | Payments and reports |
| Team organizer | Customer-side booking contact |

## Resource and offering

### Resource

- `KP-TURF-01`: Main Turf
- Outdoor with floodlights
- Independent resource
- Capacity information is descriptive; one booking reserves the entire turf

### Offering

- `KP-5A-60`: 5-a-side Football, 60 minutes
- Fixed slots
- One team organizer/contact
- Expected participants optional
- Fixed advance required for customer-page bookings
- Staff may confirm pay-at-venue only with permission

## Synthetic schedule and prices

These are test values, not market claims.

| Period | Price |
|---|---:|
| 06:00–16:00, Sun–Wed | ৳1,200 |
| 16:00–22:00, Sun–Wed | ৳1,800 |
| 22:00–01:00, Sun–Wed | ৳1,500 |
| 06:00–16:00, Thu–Sat | ৳1,500 |
| 16:00–01:00, Thu–Sat | ৳2,200 |

Default customer-page advance: ৳500.

## Booking-channel mix for simulation

| Source | Synthetic share |
|---|---:|
| Phone | 30% |
| Messenger/WhatsApp | 25% |
| Walk-in | 10% |
| Public booking page | 35% |

Shares create fixture variety and are not market estimates.

## Payment behavior

- Cash at venue
- Manual bKash advance
- Manual Nagad advance
- Multiple payments allowed
- Refund executed manually and recorded
- No wallet, package, or split payment in pilot

## Operating rules

- Public checkout holds a slot temporarily.
- Pending staff reservation expires at its payment deadline.
- Late arrival does not extend the booking.
- Extension is allowed only if the following slot is free.
- Staff may mark no-show after the configured grace period.
- A completed payment is reversed, never deleted.
- The owner can see all manual discounts and refunds.

## Representative simulated day

```text
06:00  Walk-in, cash, immediate check-in
09:00  Phone booking created for evening, pending ৳500 advance
12:00  Pending advance verified through bKash; booking confirmed
17:00  Customer late by 15 minutes; end remains unchanged
18:00  Back-to-back confirmed booking
19:00  Public checkout and staff phone request race for same slot
20:00  Customer cancels under partial-refund policy
22:00  No-show with advance retained according to policy
00:00  Final session belongs to previous operational day
```

## Required MVP scenarios

- BKG-001 through BKG-013
- PAY-001 through PAY-010
- OPS-001 through OPS-009
- RPT-001 through RPT-007
- AUTH-001 through AUTH-006
- NFR-001 through NFR-008

## Known future pressures

- Reusable team roster
- Split payment among players
- Recurring weekly booking
- Waiting list for peak evening slots
- Loyalty/off-peak campaign

These pressures must not expand the pilot.

## Expected reporting checks

- Booking value differs from collections when future advances exist.
- Evening occupancy exceeds daytime occupancy in the synthetic fixture.
- No-show consumes reserved occupancy but not played utilization.
- Refund appears on refund date while cancellation belongs to booking/service
  reporting.
- Midnight session uses exact timestamp and configured operational date.

## Success condition

Booking Staff can complete ordinary actions from Today without navigating
through multi-venue or multi-sport complexity.
