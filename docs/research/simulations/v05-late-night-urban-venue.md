# V-05: Late-Night Urban Venue

Status: Synthetic archetype
Purpose: Exercise midnight boundaries, shifts, cash closing, and degraded connectivity

## Business profile

**Synthetic name:** NightPlay Arena
**Location type:** Dhaka urban rooftop/indoor facility
**Business shape:** One venue, two independent futsal courts
**Primary activity:** Futsal
**Operating hours:** 15:00–03:00
**Operational-day cutoff:** 05:00

This archetype protects the product from date and reporting errors when business
operations cross midnight.

## People

| Person | Access |
|---|---|
| Owner | Remote business oversight |
| Evening Manager | Manager until closing |
| Shift A Booking Staff | 15:00–22:00 |
| Shift B Booking Staff | 22:00–03:30 |
| Finance/Reports | Next-day reconciliation |

## Resources and offering

- `NP-COURT-01`: Futsal Court A
- `NP-COURT-02`: Futsal Court B
- Offering: Futsal, 60-minute fixed slot

## Synthetic prices

| Period | Price |
|---|---:|
| 15:00–18:00 | ৳1,400 |
| 18:00–00:00 | ৳2,200 |
| 00:00–03:00 | ৳1,700 |

A Friday operational day includes early-Saturday sessions until the configured
cutoff.

## Payment behavior

- Evening advances through manual MFS
- Late-night remaining balances often paid in cash
- Shift A and Shift B keep separate optional cash sessions
- Finance views payment transaction date and operational booking date
- Refund after midnight retains its actual transaction timestamp

## Operating rules

- Exact timestamps are stored independently of reporting date.
- A 00:00 booking may belong to the previous operational day.
- Back-to-back 23:00–00:00 and 00:00–01:00 bookings are valid.
- Shift handover includes pending payment, arrivals, blocks, and expected cash.
- Closing a shift does not close online availability.
- Cached Today view may display last sync, but offline request is not confirmed.

## Representative simulated operational day

```text
15:00  Shift A opens optional cash session
18:00  Peak bookings begin
21:45  Shift A records handover for pending 23:00 payment
22:00  Shift B acknowledges handover
23:00  Customer checks in and pays remaining cash
23:55  Online customer begins checkout for 00:00 slot
00:00  Booking confirms on next calendar date, previous operational day
01:00  Temporary internet loss; staff views cached schedule
01:05  Staff records provisional offline note, not confirmed booking
01:15  Connection returns and slot is revalidated
03:00  Final session ends
03:20  Shift B reconciles expected versus counted cash
```

## Required MVP scenarios

- BKG-001 through BKG-013
- PAY-001 through PAY-012
- OPS-001 through OPS-014
- RPT-001 through RPT-010
- AUTH-001 through AUTH-008
- SUB-001 through SUB-005
- NFR-001 through NFR-012

## Known future pressures

- Stronger offline operation
- Automated gate/light control
- More formal workforce scheduling
- Late-night pricing recommendations

## Expected reporting checks

- Service date, transaction date, and operational date can differ.
- Daily collections use transaction time.
- Venue operational summary uses operational day.
- Shift cash sessions reconcile independently.
- Owner's Today view remains understandable around midnight.

## Success condition

No booking, payment, report, or audit entry becomes ambiguous merely because it
occurs across midnight or a staff handover.
