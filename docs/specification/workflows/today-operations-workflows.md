# Today Operations and Exception Workflows

Status: Approved behavioral baseline

## WF-OPS-001: Operate arrival through completion

Priority: P0
Primary actor: Booking Staff
Scenarios: OPS-001, OPS-004, BKG-012, PAY-005

### Main path

1. Staff opens assigned venue Today.
2. Staff selects expected booking.
3. Staff verifies contact/reference, resource, time, add-ons, and due.
4. Staff records remaining payment or authorized exception.
5. Staff marks Checked in.
6. Staff marks In progress when play begins.
7. At end, staff marks Finished.
8. System marks booking Completed according to completion rule and records
   actual attendance times where supported.

### Rules

- Booking, payment, and attendance state remain visible together but separate.
- Time suggestions do not prove attendance.
- Completion does not invent payment.

## WF-OPS-002: Handle walk-in

Priority: P1
Primary actor: Booking Staff
Scenarios: OPS-002, CUS-008, PAY-001

### Main path

1. Staff selects current available resource/slot.
2. Staff searches/creates minimal customer or chooses enabled Anonymous Walk-in.
3. System calculates price.
4. Staff records payment.
5. System confirms booking and optionally checks in immediately.

### Exceptions

- Slot already taken: deny and show current alternatives.
- Anonymous disabled or transaction requires contact: request minimum details.
- Payment unresolved: apply venue confirmation/check-in policy.

## WF-OPS-003: Handle late arrival, no-show, and extension

Priority: P1
Primary actor: Booking Staff or Manager
Scenarios: OPS-003, BKG-011, BKG-013, BKG-014

### Late arrival

1. System/staff marks booking Late after grace period.
2. Original end remains.
3. Staff can still check in.

### No-show

1. Staff reviews contact attempt and policy.
2. Authorized actor marks No-show.
3. System preserves reserved occupancy and applies explicit financial result.

### Extension

1. Staff selects duration/adjacent fixed period.
2. System checks following capacity and policy.
3. If available, calculate extra price and confirm.
4. If unavailable, reject without altering booking.

## WF-OPS-004: Block resource and resolve affected bookings

Priority: P0
Primary actor: Manager
Scenarios: OPS-005, OPS-006, OPS-007, BKG-010

### Main path without conflict

1. Manager selects resource, interval, category, internal reason, and optional
   public message.
2. System checks affected capacity.
3. No booking exists; block is created and availability updates.

### Affected-booking path

1. System lists every affected booking.
2. Manager cannot silently finalize destructive consequences.
3. For each booking, manager records keep/reassign/reschedule/cancel/contact
   resolution.
4. Block becomes active under defined policy.
5. All actions are audited and notifications emitted.

### Urgent safety path

Urgent block may activate immediately, but unresolved bookings remain visible as
critical tasks. Safety does not wait for commercial resolution.

## WF-OPS-005: Reassign resource

Priority: P1
Primary actor: Manager
Scenarios: BKG-015, BKG-016, OPS-016

### Main path

1. Manager selects booking and alternative resource.
2. System verifies same venue/allowed offering compatibility and availability.
3. System calculates price difference.
4. Manager resolves additional due/refund/waiver.
5. System changes assignment atomically.
6. Original resource and reason remain in history.

### Exceptions

- Alternative occupied/incompatible: deny.
- Customer declines price/alternative: continue to reschedule/cancel workflow.

## WF-OPS-006: Shift handover and close

Priority: P1
Primary actor: Booking Staff
Scenarios: OPS-009, OPS-015, PAY-012

### Main path

1. Outgoing staff opens handover.
2. System lists pending arrivals, dues, unverified payments, blocks, incidents,
   and reconciliation status.
3. Staff adds concise notes and marks handover submitted.
4. Incoming staff acknowledges items.
5. Outgoing staff closes optional shift/cash session.

### Rules

- Unresolved items do not disappear.
- Shift closure does not change venue availability.
- After-midnight records use operational day and exact timestamps.

## Degraded connectivity behavior

Scenarios: OPS-012, OPS-013, NFR-009

1. Today may display cached read-only data with last-sync time.
2. Staff may record a clearly provisional note.
3. No offline action is represented as confirmed booking/payment.
4. On reconnect, server revalidation determines valid next action.

