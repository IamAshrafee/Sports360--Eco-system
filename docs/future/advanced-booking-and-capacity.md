# Advanced Booking and Capacity

Status: Future capability brief
Likely horizon: H2–H3

## Purpose

The pilot proves independent fixed-slot booking. Later venues may sell time,
space, and capacity in more complex ways. This brief defines those extensions
without adding them to the pilot.

## FC-101: Flexible-duration booking

### Value

Supports facilities where customers choose start time and duration rather than
selecting a predefined slot.

Examples:

- Training room for 90 minutes
- Cricket net in 30-minute increments
- Stadium or field for three hours

### Representative workflow

```text
Choose resource/offering
→ Choose start time
→ Choose permitted duration
→ Price each applicable period
→ Check resulting interval
→ Hold and confirm
```

### Core rules

- Offering defines minimum, maximum, and duration increment.
- A booking crossing rate periods needs a documented price-resolution rule.
- Small unusable gaps may be prevented through start-time rules.
- Preparation/cleanup buffers may reserve time around the customer interval.
- Extensions use the same duration and price engine.

### Dependencies

- Reliable interval availability
- Price segmentation
- Buffer representation
- Clear calendar UX

### MVP seam

Store exact start/end timestamps and keep availability interval-based even when
the pilot UI generates fixed slots.

### Promotion trigger

Repeated qualified venues cannot represent normal inventory through fixed slots
without manual workarounds.

## FC-102: Composite and divisible resources

### Value

Allows one physical area to be sold as smaller components or a combined whole.

Examples:

- Full football field or Half A/Half B
- Two adjacent courts combined for an event
- Several cricket nets sharing a restricted practice zone

### Representative workflow

```text
Configure atomic spaces
→ Define sellable combinations
→ Attach offerings to combinations
→ Booking reserves required atomic capacity
→ Related options become unavailable
```

### Core rules

- Physical atomic units are the conflict foundation.
- A sellable combination reserves one or more units.
- Partial bookings block only the units they consume.
- Changing a resource relationship cannot invalidate historical bookings.
- Maintenance on one atomic unit affects every combination requiring it.
- Capacity combinations need clear staff and customer labels.

### Dependencies

- Resource relationship model
- Conflict groups/atomic reservation units
- Availability explanation
- Migration from independent resource configuration

### MVP seam

Use Resource and Offering separately, avoid hardcoding one sport or one calendar
row type, and isolate conflict evaluation behind a service/invariant.

### Promotion trigger

At least two valuable target venues actively sell the same space in component
and combined configurations.

## FC-103: Recurring reservations

### Value

Supports teams, academies, companies, and coaches reserving repeated time.

### Representative workflow

```text
Choose offering and recurrence
→ Preview all occurrences and conflicts
→ Resolve skipped/conflicting dates
→ Choose price/payment policy
→ Confirm series
→ Manage one occurrence or future series
```

### Core rules

- A series template and its occurrences are separate.
- Editing “this occurrence,” “this and following,” and “entire series” must be
  explicit.
- Conflicts are reported before confirmation; partial series acceptance needs
  clear consent.
- Holidays and closures create exceptions, not silent deletion.
- Price may be locked for the series or calculated per occurrence.
- Payment may be per occurrence, period, deposit, or invoice.
- Cancellation and no-show history belongs to each occurrence while preserving
  series context.

### Dependencies

- Occurrence generator
- Exception model
- Bulk conflict preview
- Series-aware payment and notification
- Package/membership connection later

### MVP seam

Bookings remain individual records that can later reference an optional series.
Do not encode recurrence into the booking status itself.

### Promotion trigger

Recurring customers represent meaningful volume and staff repeatedly duplicate
bookings manually.

## FC-104: Waiting list and cancellation fill

### Value

Captures unmet demand and helps refill cancelled peak slots.

### Representative workflow

```text
Unavailable slot/resource
→ Customer joins waiting list with acceptable range
→ Capacity opens
→ Ranked eligible customers are notified
→ Temporary exclusive offer hold
→ First valid acceptance confirms
```

### Core rules

- Customer specifies resource/date/time flexibility.
- Priority policy must be transparent: first-come, membership, manual selection,
  or another approved rule.
- Notification does not equal booking.
- Offer has an expiry and conflict-safe hold.
- Customers control communication preferences.
- Staff can see but cannot silently manipulate priority without audit.

### Dependencies

- Reliable notification
- Holds and expiry
- Customer preferences
- Fairness/priority policy

### MVP seam

Use extensible booking source and hold models; preserve cancellation events that
can trigger later workflows.

### Promotion trigger

Pilot data shows repeat sell-outs alongside meaningful cancellation loss.

## FC-105: Multi-resource and private-event booking

### Value

Supports one commercial reservation requiring several resources or services:

- Corporate sports day
- Tournament package
- Full venue rental
- Field plus changing room and equipment

### Representative workflow

```text
Build event request
→ Select required resources/services
→ Check all capacity atomically
→ Quote/deposit
→ Approve and confirm
→ Fulfill through an event schedule
```

### Core rules

- Either all required capacity confirms or none does.
- Quote versions and accepted commercial terms are preserved.
- Deposit milestones may differ from ordinary slot booking.
- One event may contain several scheduled components.
- Cancellation may apply at event and component level.

### Dependencies

- Composite reservation transaction
- Quote and approval
- Event/customer organization model
- Multi-payment schedule

### MVP seam

Keep booking commercial snapshot and add-on lines extensible. Avoid assuming a
customer relationship can have only one booking contact or invoice context
forever.

### Promotion trigger

Private/corporate events form a repeatable, high-value revenue stream across
target venues.

## FC-106: Full offline operation

### Value

Allows critical reception work through longer connectivity loss.

### Risk

Two disconnected devices can both reserve the same physical capacity. A naive
offline-first booking experience breaks the product's core promise.

### Possible future model

- Cached read access with clear freshness
- Local provisional requests, not guaranteed bookings
- One designated venue-local authority/server for advanced deployments
- Conflict-resolution queue after reconnect
- Offline cash records linked after booking validation
- Device identity and tamper-resistant sync history

### Dependencies

- Proven connectivity problem
- Local conflict authority or explicit provisional semantics
- Sync protocol
- Device and security management
- Operational recovery workflow

### MVP seam

Use idempotency keys, durable event/audit records, and a clear distinction
between provisional and confirmed. Pilot remains online-confirmation only.

### Promotion trigger

Observed outages materially prevent operation and simpler connectivity
mitigations are insufficient.

## Shared architecture implications

Future capacity features benefit from:

- Interval-based booking invariants
- Provider-neutral holds and expiry
- Exact resource/offering separation
- Optional series/group references
- Atomic transaction boundaries
- Immutable historical snapshots
- Versioned policies and quotes

They do not require implementing future UI, tables, or algorithms during H0.
