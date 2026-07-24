# V-02: Multi-Court Badminton Venue

Status: Synthetic archetype
Purpose: Exercise several parallel resources, walk-ins, and simple add-ons

## Business profile

**Synthetic name:** ShuttleHouse Courts
**Location type:** Indoor urban venue
**Business shape:** One venue, four independent badminton courts
**Primary activity:** Badminton
**Operating hours:** 06:00–23:00 daily

This archetype tests a dense resource timeline, returning customers, same-time
bookings on different courts, and equipment add-ons.

## People

| Person | Access |
|---|---|
| Owner | Entire business |
| Venue Manager | Operations, pricing, staff, reports |
| Morning Booking Staff | Assigned venue |
| Evening Booking Staff | Assigned venue |
| Finance/Reports | Payments, refunds, export |
| Regular customer | Registered player/contact |

## Resources

- `SH-COURT-01`: Court 1
- `SH-COURT-02`: Court 2
- `SH-COURT-03`: Court 3
- `SH-COURT-04`: Court 4

All are independent pilot resources. Court combination for events is a future
pressure only.

## Offering

- `SH-BADM-60`: Badminton Court Rental, 60 minutes
- Fixed slots
- One responsible contact
- Participant count optional
- Pay-at-venue permitted
- Public booking may require a percentage advance for evening periods

## Synthetic prices

| Period | Price per court/hour |
|---|---:|
| 06:00–10:00 | ৳500 |
| 10:00–16:00 | ৳400 |
| 16:00–23:00 | ৳700 |
| Public holiday override | ৳800 |

Test add-ons:

- Racket rental: ৳80 each
- Shuttle tube: ৳250
- Drinking water package: ৳100

Inventory is not enforced in the pilot; fulfillment and quantities are
recorded.

## Booking behavior

- Morning regulars often book by phone.
- Afternoon has low demand and walk-ins.
- Evening periods are close to capacity.
- Customers may ask for a particular court.
- Returning customer lookup by phone should be fast.

## Operating rules

- Different courts can be booked simultaneously.
- The same court cannot overlap.
- A block on Court 2 must not block Courts 1, 3, or 4.
- Maintenance block affecting an existing booking requires resolution.
- Add-ons preserve booking-time price and quantity.
- Anonymous walk-in may be allowed for immediate low-risk use.
- Manager permission is required to merge duplicate customer records.

## Representative simulated day

```text
06:00  Two registered regulars book Courts 1 and 2
08:00  Same customer contact holds Court 3 for a group
13:00  Anonymous walk-in takes Court 4 and rents two rackets
17:00  All courts reserved simultaneously
18:00  Court 2 light problem creates a block and affects one booking
18:00  Manager moves customer from Court 2 to newly free Court 4
20:00  Duplicate customer warning appears for normalized phone
22:00  Staff applies owner-approved complimentary add-on
```

## Required MVP scenarios

- BKG-001 through BKG-014
- CUS-001 through CUS-008
- PAY-001 through PAY-010
- OPS-001 through OPS-012
- RPT-001 through RPT-009
- AUTH-001 through AUTH-008
- NFR-001 through NFR-008

## Known future pressures

- Limited racket inventory
- Prepaid ten-session package
- Recurring regular-customer series
- Coaching class with seat capacity
- Combining courts for a tournament

## Expected reporting checks

- Resource occupancy calculates per independent court.
- Venue occupancy aggregates resource-minutes correctly.
- A blocked court reduces available capacity.
- Add-on revenue remains visible separately.
- Anonymous walk-in does not create a false registered customer.
- Court reassignment preserves original history.

## Success condition

Staff can understand four simultaneous court schedules at a glance and create a
walk-in booking with payment and add-ons in under the scripted target time.
