# V-03: Mixed-Sport Complex

Status: Synthetic archetype
Purpose: Exercise the broadest private-pilot configuration and role model

## Business profile

**Synthetic name:** GreenField Sports Complex
**Location type:** Developing urban/peri-urban area
**Business shape:** One venue, nine independent resources
**Activities:** Football, badminton, table tennis
**Operating hours:** 07:00–00:00

This is the primary comprehensive archetype. It tests different resource
terminology, offerings, prices, staff responsibilities, and owner reporting
within one tenant.

## People

| Person | Access |
|---|---|
| Owner | Entire business and subscription |
| General Manager | Venue operations and staff |
| Booking Staff A | Bookings/customers/collections |
| Booking Staff B | Bookings/customers/collections |
| Finance Officer | Payments/refunds/expenses/reports |
| Support Employee | No account in pilot unless required |
| Registered player | Customer portal |
| Company organizer | Organization booking contact |

## Resources and offerings

### Football

- Turf 1 → 5-a-side Football, 60 minutes
- Turf 2 → 5-a-side Football, 60 minutes

### Badminton

- Court 1 → Badminton, 60 minutes
- Court 2 → Badminton, 60 minutes
- Court 3 → Badminton, 60 minutes

### Table tennis

- Table 1 → Table Tennis, 60 minutes
- Table 2 → Table Tennis, 60 minutes
- Table 3 → Table Tennis, 60 minutes
- Table 4 → Table Tennis, 60 minutes

Every resource is independent in pilot. A full complex/private event is future
scope.

## Synthetic rate overview

| Offering | Off-peak | Peak |
|---|---:|---:|
| Football Turf | ৳1,400 | ৳2,100 |
| Badminton Court | ৳450 | ৳700 |
| Table Tennis Table | ৳250 | ৳400 |

Peak is a recurring configured time band. One future public holiday has a
specific-date override.

## Payment and confirmation

- Football public booking: fixed advance
- Badminton public booking: percentage advance during peak
- Table tennis: pay at venue permitted
- Staff can record cash, manual bKash, manual Nagad
- Finance Officer can reverse/refund; Booking Staff cannot
- Company organizer may receive a manual reference/invoice note but no corporate
  account-credit system in pilot

## Operational configuration

- Venue-level operating schedule inherited by resources
- Table Tennis Table 4 has a later opening override
- Court 3 has a maintenance block
- Turf 2 has an emergency weather closure scenario
- Amenities: parking, washroom, changing room, drinking water
- Add-ons: football, racket, referee, extra lighting, refreshments

## Representative simulated day

```text
07:00  Owner views all-resource Today summary
08:00  Staff creates phone bookings for football and badminton
10:00  Company organizer reserves two separate resources sequentially
14:00  Walk-in table-tennis booking with cash
16:00  Pending online football advance expires and releases slot
18:00  Maximum cross-sport concurrent activity
19:00  Court maintenance affects availability only for Court 3
20:00  Weather closes Turf 2; booking moved/refunded after review
21:00  Unauthorized staff refund attempt denied and audited
23:00  Finance reconciles cash and digital methods
```

## Required MVP scenarios

This archetype should run the full scenario catalogue.

## Known future pressures

- Multi-resource corporate event
- Tournament
- Membership across activities
- Resource-specific package
- Advanced equipment inventory
- Staff scheduling
- Second venue
- Public marketplace discovery

## Expected reporting checks

- Filter by activity, resource, offering, source, status, and payment method.
- Compare revenue per available hour across different resource types.
- Business total equals sum of traceable source records.
- Booking value, completed revenue, collections, and refunds remain distinct.
- Venue cancellation is separate from customer cancellation.
- Finance access spans money while Booking Staff cannot export sensitive data.

## Success condition

The shared domain model handles all three sports without sport-specific booking
code or confusing staff navigation.
