# V-04: Cricket Practice Facility

Status: Synthetic archetype
Purpose: Exercise cricket-net rental, coaching assignments, and future-duration pressure

## Business profile

**Synthetic name:** BoundaryLine Cricket Nets
**Location type:** Urban training facility
**Business shape:** One venue, three independent cricket nets
**Activities:** Cricket practice and coaching
**Operating hours:** 06:00–22:00

This archetype validates that Activity and Offering are broader than ordinary
team matches. It also preserves a path toward coaching and flexible duration
without adding those systems to the pilot.

## People

| Person | Access or relationship |
|---|---|
| Owner/Head Coach | Business Owner |
| Venue Manager | Manager |
| Booking Staff | Booking and collection |
| Coach A | Assigned operational participant; no distinct pilot role |
| Coach B | Assigned operational participant; no distinct pilot role |
| Academy guardian | Booking contact for a participant |
| Individual player | Guest or registered customer |

## Resources

- `BL-NET-01`: Pace Net
- `BL-NET-02`: Spin Net
- `BL-NET-03`: General Practice Net

Pilot treats each net as independently reservable.

## Pilot offerings

- `BL-PRACTICE-60`: Independent Net Practice, 60 minutes
- `BL-COACH-60`: Private Coaching Session, 60 minutes

Private Coaching uses the same fixed-slot resource booking with an assigned
coach note/reference. Full coach availability and commission scheduling are
future capabilities.

## Synthetic prices

| Offering | Off-peak | Peak |
|---|---:|---:|
| Net Practice | ৳600 | ৳900 |
| Private Coaching | ৳1,200 | ৳1,500 |

Add-ons:

- Bowling machine use: ৳400
- Practice ball set: ৳150
- Protective gear: ৳200

Prices are test fixtures only.

## Booking and customer behavior

- Individual practice may be booked on the same day.
- Guardian may book coaching for a youth participant.
- Booker, payer, participant, and coach may be different people.
- Some customers request 30 or 90 minutes, but pilot offers fixed 60-minute
  slots.
- Coaching requires staff confirmation until full coach scheduling exists.

## Operating rules

- One responsible booking contact is required.
- Participant name/age group is optional and minimized.
- Guardian is the contact/payer where applicable.
- Coaching offering requires an assigned available coach during manual review.
- Bowling-machine add-on is not inventory-conflict-aware in pilot.
- Staff cannot expose guardian/customer details to unrelated users.
- A resource block affects practice and coaching offerings on that net.

## Representative simulated day

```text
06:00  Individual player books General Net, pay at venue
08:00  Guardian books youth coaching with fixed advance
10:00  Coach becomes unavailable; manager reassigns or reschedules
13:00  Player asks for 90 minutes; staff can book adjacent fixed slots
16:00  Bowling-machine add-on recorded
18:00  All three nets booked with different offerings
20:00  Net 1 safety issue creates urgent block
```

## Required MVP scenarios

- BKG-001 through BKG-014
- CUS-001 through CUS-009
- PAY-001 through PAY-010
- OPS-001 through OPS-013
- AUTH-001 through AUTH-008
- RPT-001 through RPT-009
- NFR-001 through NFR-008

## Known future pressures

- Flexible 30/60/90-minute duration
- Group coaching class with seat capacity
- Coach calendar and commission
- Academy batches, guardian/student records, attendance, fees
- Limited bowling-machine inventory
- Recurring practice packages

## Expected architecture checks

- Activity/Offering supports coaching without changing Resource semantics.
- Booking Contact is not assumed to be the participant.
- Staff assignment is optional/extensible.
- Adjacent fixed bookings remain separate in pilot.
- Future flexible duration can use the same exact interval model.

## Success condition

The pilot can sell fixed cricket practice and coaching sessions safely without
prematurely implementing an academy or workforce system.
