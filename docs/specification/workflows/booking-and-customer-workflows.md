# Booking and Customer Workflows

Status: Approved behavioral baseline

## WF-BKG-001: Create staff-assisted booking

Priority: P0
Primary actor: Booking Staff
Sources: phone, Messenger, WhatsApp, walk-in, other/manual
Scenarios: BKG-001, BKG-004, BKG-007, CUS-001, CUS-002

### Preconditions

- Actor has booking-create permission for venue.
- Offering and fixed slot are active.

### Main path

1. Staff opens Today/calendar and selects available resource/slot.
2. System rechecks current availability.
3. Staff searches customer by normalized phone or creates guest.
4. Staff selects source and responsible contact/team/organization.
5. System calculates price and displays policy/required advance.
6. Staff adds permitted add-ons or discount.
7. Staff records payment now or creates pending deadline as permitted.
8. System atomically creates Pending or Confirmed booking.
9. Booking reference and shareable confirmation are available.

### Exceptions

- Slot changed since display: creation fails safely and shows alternatives.
- Customer restricted: enforce full advance/manager approval/block condition.
- Discount exceeds permission: require Manager action.
- Payment entry fails: booking remains in the defined pending/unpaid state; no
  duplicate money on retry.

### Postconditions

- Source, creator, customer/contact, price/policy snapshot, and status persist.
- Capacity is reserved only for states configured to reserve it.
- Audit and notification event are emitted.

## WF-PUB-001: Create public customer booking

Priority: P0
Primary actor: Guest or Registered Customer
Scenarios: BKG-002 through BKG-005, CUS-003, CUS-004, PAY-002, PAY-003

### Main path

1. Customer opens published venue page.
2. Customer selects activity/offering, date, and available fixed slot.
3. System revalidates and creates expiring hold.
4. Customer enters name/phone and optional team/organization details.
5. Customer verifies phone by OTP.
6. Customer reviews exact price, advance/payment requirement, and policy.
7. Customer submits manual MFS information or supported payment arrangement.
8. System verifies requirement or creates Pending verification state.
9. On satisfaction, booking confirms atomically and hold is consumed.
10. Customer receives booking reference and secure access link.

### Exceptions

- OTP fails/expires: hold continues only until original expiry.
- Hold expires mid-flow: no confirmation; explain and return to availability.
- Another actor reserved capacity before hold creation: show unavailable.
- Manual MFS evidence pending: booking state and reservation deadline are clear.
- Notification delivery fails: booking remains valid and reference remains
  accessible.

## WF-BKG-002: Pending booking and payment deadline

Priority: P0
Primary actor: Booking Staff or System
Scenarios: BKG-005, BKG-006, PAY-002, PAY-006

### Main path

1. Booking is created Pending with exact requirement and expiry.
2. Capacity reservation behavior is visible to staff.
3. Customer submits/settles required payment.
4. Authorized staff/system verifies before deadline.
5. Booking becomes Confirmed.

### Expiry path

1. Deadline passes without satisfied requirement.
2. Idempotent background process marks booking Expired.
3. Capacity releases.
4. Any received late payment enters exception review; it does not silently
   recreate the booking.
5. Audit and notification result are recorded.

## WF-BKG-003: Reschedule booking

Priority: P0
Primary actor: Booking Staff or Manager
Scenarios: BKG-008

### Main path

1. Actor opens existing eligible booking.
2. System shows policy and available alternatives.
3. Actor selects new resource/time.
4. System checks compatibility and availability.
5. System calculates new price and difference.
6. Actor resolves additional due or permitted credit/refund result.
7. System atomically changes reservation and preserves original schedule.
8. Reason, actor, policy result, and notification are recorded.

### Exceptions

- New slot becomes unavailable: no change to original.
- Reschedule not allowed by policy: require authorized exception with reason.
- Lower/higher price: financial difference must not disappear.

## WF-BKG-004: Cancel booking

Priority: P0
Primary actor: Customer, Booking Staff, or Manager
Scenarios: BKG-009, BKG-010, PAY-009, PAY-010

### Main path

1. Actor requests cancellation.
2. System identifies cancelling party and effective policy snapshot.
3. System calculates fee/refund/remaining result.
4. Authorized actor confirms.
5. Booking becomes Cancelled and capacity releases.
6. Refund is recorded/executed through its separate workflow.
7. Reason, actor, policy, exception, and notification persist.

### Rules

- Customer and venue cancellations are reported separately.
- Cancellation never deletes the booking.
- Refund failure does not reverse the cancellation automatically.
- Venue cancellation offers explicit replacement/reschedule/refund resolution.

## WF-CUS-001: Find, create, and merge customer

Priority: P1
Primary actor: Booking Staff or Manager
Scenarios: CUS-001, CUS-002, CUS-005, AUTH-011

### Find/create

1. Staff searches normalized phone/name.
2. System returns tenant-local permitted results.
3. Staff selects confirmed match or creates guest.
4. Possible duplicate warning never auto-merges.

### Merge

1. Authorized Manager opens two potential duplicates.
2. System previews contacts, notes, restrictions, bookings, and financial links.
3. Manager chooses retained values.
4. System merges relationship references without rewriting booking snapshots.
5. Merge mapping and actor remain auditable/correctable.

## WF-CUS-002: Create team or organization booking

Priority: P1
Primary actor: Booking Staff or Team/Organization Contact
Scenarios: CUS-007, CUS-009

### Main path

1. Select booking contact.
2. Enter optional team/organization name and participant count.
3. If relevant, distinguish payer and participant/guardian.
4. Continue through staff or public booking workflow.

### Rules

- Participant registration is optional.
- Venue sees only information relevant to its own booking.
- Team name is not treated as a global verified organization.
- Pilot does not create roster, split payment, or cross-venue team history.

