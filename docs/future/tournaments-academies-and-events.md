# Tournaments, Academies, and Events

Status: Future capability brief
Likely horizon: H2

## Purpose

Many sports venues earn beyond ordinary slot rental through organized
competitions, coaching, academies, and private events. These products share
venue capacity but need domain workflows beyond a standard booking.

## FC-301: Tournament management

### Value

Lets a venue or organizer publish, register, schedule, operate, and report a
competition.

### Representative workflow

```text
Create tournament
→ Define sport/format/eligibility/fees
→ Open registration
→ Verify teams and collect fees
→ Generate groups/bracket/schedule
→ Reserve resources
→ Record results
→ Complete prizes/settlement
```

### Core concepts

- Tournament
- Division/category
- Registration
- Participant/team roster
- Stage/group/bracket
- Match
- Resource assignment
- Result/standings
- Fee/refund/prize

### Core rules

- Registration state is separate from payment state.
- Format may be knockout, round-robin, group plus knockout, or custom.
- A generated schedule still passes through resource conflict validation.
- Team eligibility and roster deadlines are versioned.
- Match rescheduling updates bracket/standings dependencies safely.
- Walkover, cancellation, tie-break, and dispute rules are explicit.
- Public results distinguish provisional from final.
- Prize and organizer money require separate financial treatment.

### Dependencies

- Reusable teams/participants
- Multi-resource/event scheduling
- Registration and fee collection
- Notification
- Public pages
- Moderation/dispute process

### MVP seam

Activity and booking models remain generic; tournament matches can later
reference ordinary resource reservations without turning every booking into a
match.

### Promotion trigger

Several target venues run tournaments often enough that spreadsheets and manual
scheduling create repeated operational pain or meaningful revenue.

## FC-302: League and season management

### Value

Supports longer competitions with recurring fixtures, standings, and team
administration.

### Representative workflow

```text
Create season/division
→ Register teams
→ Generate fixtures
→ Reserve capacity
→ Record results and disciplinary events
→ Calculate standings
→ Handle postponements
→ Close season
```

### Core rules

- Standings formula and tie-break order are configurable and versioned.
- Result correction is audited and recalculates dependent standings.
- Postponement preserves original fixture history.
- Venue/resource scheduling remains conflict-safe.
- Discipline/statistics are optional modules, not required for basic leagues.

### Dependencies

- Tournament foundations
- Recurring/multi-resource scheduling
- Teams
- Public result pages

### Promotion trigger

Season-long organized play is a repeatable target segment, not a one-off custom
request.

## FC-303: Coaching sessions and classes

### Value

Allows venues and coaches to sell instruction rather than only resource time.

### Representative workflow

```text
Configure coach/service/class capacity
→ Publish schedule
→ Customer enrolls or books privately
→ Collect payment/package unit
→ Record attendance
→ Handle substitute/cancellation
```

### Core rules

- Private session and group class are distinct offering modes.
- Class capacity tracks seats as well as reserved resource time.
- Coach availability and resource availability must both be satisfied.
- Customer enrollment can cover one occurrence or a series.
- Cancellation may depend on coach, venue, or participant.
- Coach compensation does not alter customer payment history.

### Dependencies

- Staff/service-provider scheduling
- Capacity-based enrollment
- Recurring occurrences
- Package/membership redemption
- Attendance

### MVP seam

Use Activity/Offering rather than hardcoded sports only. Keep responsible staff
assignment extensible on bookings.

### Promotion trigger

Pilot venues sell coaching regularly and need a combined resource/coach/
participant schedule.

## FC-304: Academy management

### Value

Supports ongoing student programs with groups, schedules, attendance, fees, and
guardian communication.

### Representative workflow

```text
Create program/batch
→ Enroll student and guardian
→ Assign coach and schedule
→ Invoice/collect periodic fee
→ Record attendance/progress
→ Communicate changes
```

### Core rules

- Student, guardian, payer, and participant may be different people.
- Child data is minimized and access-restricted.
- Batch capacity and wait list are explicit.
- Fee schedule, scholarship/discount, pause, and withdrawal are traceable.
- Attendance correction is audited.
- Progress/health information requires separate privacy review.

### Dependencies

- Guardian/minor model
- Recurring classes
- Periodic billing
- Staff scheduling
- Privacy and safeguarding policy

### MVP seam

Booking contact and participant are not assumed to be the same person.

### Promotion trigger

Academies become a chosen customer segment and professional child/privacy review
is complete.

## FC-305: Corporate and private events

### Value

Supports high-value bookings that combine spaces, services, quotes, and staged
payments.

### Representative workflow

```text
Receive inquiry
→ Build quote and reserve provisional capacity
→ Negotiate/version terms
→ Collect deposit
→ Confirm resources/services
→ Execute event checklist
→ Final invoice and settlement
```

### Core rules

- Inquiry, quote, hold, confirmed event, and component bookings are separate
  states.
- Quote versions and customer acceptance are preserved.
- Capacity can span resources and non-playing spaces.
- Deposit/payment milestones and cancellation terms are explicit.
- Event contact, payer, participants, and invoice recipient may differ.

### Dependencies

- Multi-resource booking
- Quote/versioning
- Organization customer
- Staged payment
- Operational checklist

### MVP seam

Preserve commercial line items and organization/contact roles; do not assume
all business is one slot/one payer forever.

### Promotion trigger

Event revenue is material and ordinary booking workarounds are insufficient.

## Shared boundaries

Organized-sports features should not:

- Make the ordinary booking calendar dependent on brackets or academies.
- Require every venue to enable complex participant data.
- Mix organizer funds, prizes, venue revenue, and SaaS revenue.
- Publish participant information without appropriate consent.

They should reuse booking, payment, customer, resource, notification, and audit
foundations through explicit references.
