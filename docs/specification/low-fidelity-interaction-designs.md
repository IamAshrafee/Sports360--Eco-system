# Low-Fidelity Interaction Designs

Status: Phase 2 behavioral wireframes

## Purpose

These wireframes establish hierarchy and interaction decisions before visual
branding. They are not pixel designs. Text in brackets represents an action;
text in parentheses represents status or supporting information.

## 1. Today — desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Venue: Uttara Sports Hub ▾   Operational day: 24 Jul   Online · Updated now │
├──────────────┬──────────────────────────────────────┬───────────────────────┤
│ TODAY        │ NOW / NEXT                           │ NEEDS ATTENTION       │
│ Calendar     │                                      │                       │
│ Customers    │ 18:00–19:00  Turf 1   IN PROGRESS   │ 2 payments to verify  │
│ Payments     │ Rahim XI · Paid ৳1,000 · Due ৳500    │ 1 pending expires 6:20│
│ Reports      │ [Open booking] [Finish]              │ 1 late arrival        │
│              │                                      │ 1 blocked booking     │
│ Setup        │ 19:00–20:00  Court 2   CONFIRMED     │ [Review all]          │
│ Team         │ Badminton Club · Paid in full        │                       │
│ Subscription │ [Check in] [Open]                    │                       │
│              ├──────────────────────────────────────┴───────────────────────┤
│              │ LATER TODAY                                                │
│              │ 20:00 Court 1 · Pending · Deadline 19:15 · Due ৳800         │
│              │ 21:00 Turf 1 · Confirmed · Manual bKash under review       │
├──────────────┴──────────────────────────────────────────────────────────────┤
│ [ + Quick booking ]  [ Walk-in ]                       Shift: [Close/handover]│
└─────────────────────────────────────────────────────────────────────────────┘
```

Decisions:

- action priority is driven by operational urgency, not booking creation time;
- paid, due, attendance, and booking state are separately labeled;
- Today does not imply that an unverified MFS claim is collected money;
- the freshness indicator becomes a prominent stale/offline banner when needed.

## 2. Today — mobile

```text
┌──────────────────────────────┐
│ Uttara Sports Hub ▾          │
│ Today, 24 Jul · Online       │
├──────────────────────────────┤
│ NEEDS ATTENTION (4)          │
│ Payment verification      2 ›│
│ Pending expiry 18 min     1 ›│
│ Late arrival              1 ›│
├──────────────────────────────┤
│ NOW                          │
│ Turf 1 · 18:00–19:00         │
│ Rahim XI · IN PROGRESS       │
│ Paid ৳1,000 · Due ৳500       │
│ [Open]              [Finish] │
├──────────────────────────────┤
│ NEXT                         │
│ Court 2 · 19:00–20:00        │
│ Badminton Club · CONFIRMED   │
│ [Open]             [Check in]│
├──────────────────────────────┤
│       [ + Quick booking ]    │
├──────────────────────────────┤
│ Today  Calendar  More        │
└──────────────────────────────┘
```

The floating/sticky booking action must not obscure the last card or rely on a
gesture. Card actions remain reachable with keyboard and screen readers.

## 3. Staff quick booking

```text
┌─────────────────────────────────────────────┐
│ New booking                            [×]  │
│ 1 Slot → 2 Contact → 3 Payment → 4 Result  │
├─────────────────────────────────────────────┤
│ Offering        [Football — 60 min       ▾]│
│ Date            [24 Jul 2026             ] │
│ Available slot  [19:00–20:00 · Turf 1  ▾] │
│ Source          [Phone                    ▾]│
│                                             │
│ Price           ৳1,500                      │
│ Advance rule    Minimum ৳500 before 18:30   │
│ Cancellation    Free until 6 hours before   │
│                                             │
│                             [Continue]      │
└─────────────────────────────────────────────┘
```

Contact step:

```text
Phone [01712 345678] [Search]
┌ Returning customer ───────────────────────┐
│ Md Rahim · 8 bookings · (Full advance)    │
│ [Use this customer]                       │
└───────────────────────────────────────────┘
Booking for: (• Individual) ( Team/organization) ( Guardian/other participant)
Responsible contact [Md Rahim]
Participant/team     [Rahim XI]
```

Commit rules:

- slot capacity is rechecked on final submit, not trusted from the first step;
- repeat submit uses one idempotency key;
- conflict returns to slot choice with entered contact details retained;
- final result explicitly says Confirmed, Pending with deadline, or Not booked.

## 4. Booking detail

```text
┌──────────────────────────────────────────────────────────────────┐
│ BK-20260724-0182   CONFIRMED     Source: Phone                   │
│ Football · Turf 1 · 24 Jul · 19:00–20:00                        │
│ [Check in] [Reschedule] [More: Cancel · Reassign · Add payment]  │
├───────────────────────┬──────────────────────────────────────────┤
│ CONTACT               │ MONEY                                    │
│ Md Rahim              │ Booking total       ৳1,500               │
│ 017•••5678            │ Successful net paid ৳1,000               │
│ Team: Rahim XI        │ Remaining due         ৳500               │
│ [Open customer]       │ bKash ৳1,000 · VERIFIED                  │
│                       │ [View transactions]                      │
├───────────────────────┴──────────────────────────────────────────┤
│ STATUS HISTORY                                                   │
│ 17:02 Created by Arif · phone · Price rule “Evening 2026”        │
│ 17:05 Payment submitted · bKash reference ending 91              │
│ 17:08 Verified by Manager Salma                                  │
├──────────────────────────────────────────────────────────────────┤
│ Internal notes (visible according to role)                       │
└──────────────────────────────────────────────────────────────────┘
```

The booking header is the immutable orientation point. Lifecycle actions never
replace payment state with a generic “paid booking” status.

## 5. Reschedule or reassign

```text
CURRENT                    PROPOSED
24 Jul 19:00–20:00         25 Jul 20:00–21:00
Turf 1                     Turf 2
Snapshot total ৳1,500      Resolved total ৳1,800

Availability       Available now
Compatibility      Compatible
Price difference   +৳300 due
Policy result      Manager reason required

Reason [Customer requested different date________________]
[Keep current booking]                      [Confirm change]
```

If the target becomes occupied before commit, confirmation fails safely and the
current booking is unchanged. The user sees refreshed alternatives.

## 6. Resource block with affected bookings

```text
Block Turf 1
From [25 Jul 17:00]  To [25 Jul 22:00]
Reason [Unsafe surface / maintenance____________________]

⚠ This affects 3 bookings
17:00 Rahim XI       [Reassign] [Venue-cancel] [Unresolved]
18:00 Eagles Club    [Reassign] [Venue-cancel] [Unresolved]
20:00 Walk-in #188   [Reassign] [Venue-cancel] [Unresolved]

( ) Save only after all bookings have a resolution
(•) Urgent safety block now; create an unresolved action for each booking

[Cancel]                                      [Create block]
```

Urgent blocking protects safety immediately but never equates the block with
automatic booking cancellation or refund.

## 7. Manual MFS verification

```text
┌─────────────────────────────────────────────────────────────┐
│ Mobile payment verification (2)                             │
├─────────────────────────────────────────────────────────────┤
│ Booking BK-0182 · Rahim XI                                  │
│ Submitted: bKash · ৳1,000 · Ref ending 91 · to Personal 01  │
│ Similar reference: none · Submitted by Arif at 17:05        │
│ [Reject] [Open booking] [Verify]                             │
├─────────────────────────────────────────────────────────────┤
│ Booking BK-0184 · Eagles                                    │
│ Nagad · ৳800 · Ref ending 44                                │
│ ⚠ Reference also used on BK-0170                            │
│ [Investigate]                                               │
└─────────────────────────────────────────────────────────────┘
```

Verification changes the transaction’s verification outcome. It does not edit
the customer-submitted reference or delete a rejected claim.

## 8. Cash reconciliation and handover

```text
Shift: Arif · 14:00–22:00
Expected cash collections         ৳12,500
Cash refunds recorded              -৳1,000
Expected drawer                   ৳11,500
Counted cash                      [৳11,300]
Variance                            -৳200
Variance note [Customer change / recount required________]

Open handover
[x] Booking BK-0191 due ৳500
[x] Turf 1 maintenance unresolved
[ ] Payment reference ending 44 needs manager

Next employee [Nabila ▾]
[Save draft]                                    [Close & send handover]
```

Closing a shift does not erase unresolved items. A variance is never converted
into a fake booking payment.

## 9. Owner report overview

```text
Period [Today ▾] Venue [All permitted ▾]

BOOKING VALUE      COLLECTIONS       SERVICE REVENUE      DUE
৳42,000            ৳31,500           ৳28,000              ৳10,500
[38 bookings]      [42 transactions] [25 completed]       [9 bookings]

Reserved occupancy 68%  [numerator 1,224 min / available 1,800 min]
Played utilization 54%  [972 min]
Downtime                 [180 blocked min]

EXCEPTIONS
Refunds ৳2,000 · Reversals ৳500 · Discounts ৳1,200 · Cash variance -৳200
[Drill into source records]                         [Export permitted view]
```

Every card states a date basis and drills to the exact source population. No
single “revenue” card mixes future bookings, collections, and performed service.

## 10. Public booking — mobile

Availability:

```text
┌──────────────────────────────┐
│ Uttara Sports Hub            │
│ Football · 60 minutes        │
│ [‹] Fri 24 Jul [›]           │
├──────────────────────────────┤
│ 17:00  ৳1,200   [Select]     │
│ 18:00  Unavailable           │
│ 19:00  ৳1,500   [Select]     │
│ 20:00  ৳1,500   [Select]     │
├──────────────────────────────┤
│ Prices include selected slot │
│ Cancellation terms [View]    │
└──────────────────────────────┘
```

Review:

```text
Football · Turf 1
Fri 24 Jul · 19:00–20:00
Slot held for 04:32

Price                         ৳1,500
Required advance               ৳500
Remaining due at venue        ৳1,000

Contact: 017•••5678 (verified)
[x] I agree to the displayed booking and cancellation terms

[Back]                              [Confirm booking]
```

Result:

```text
✓ Booking confirmed
BK-20260724-0182
Advance received: ৳500
Due at venue: ৳1,000

[View secure booking] [Share confirmation]
```

Alternative results explicitly say `Pending until 18:30`, `Hold expired — not
booked`, or `Could not complete — no booking/payment recorded`.

## 11. Setup and publish

```text
SETUP PROGRESS  6 of 8 complete

✓ Business basics
✓ Venue
✓ Activities and resources
✓ Offerings
✓ Schedule and fixed slots
✓ Prices
! Booking policy       [Complete]
! Public contact info  [Complete]

[Preview public page]                         [Publish unavailable]
```

Once complete:

```text
Ready to publish
Available slots generated: 84 for next 7 days
Starting price: ৳800
Advance policy: Fixed ৳500
Cancellation: Free until 6 hours before

[Keep draft] [Preview as customer] [Publish]
```

Publication is a deliberate transition. Saving internal setup never
automatically exposes draft resources or availability.

## 12. Subscription restriction

```text
Subscription: RESTRICTED
Grace period ended 23 Jul

You can:
✓ View and operate existing bookings
✓ Collect existing dues
✓ Export your permitted records

You cannot:
× Create new future bookings
× Publish new availability
× Activate another staff member

[View invoice] [Submit payment reference] [Contact support]
```

Allowed operations are driven by entitlements on the server. The restriction
screen never deletes venue records or mixes subscription payment with customer
booking transactions.

## Shared interaction states

Every data screen designs these states explicitly:

| State | Required behavior |
|---|---|
| Loading | Preserve page structure where possible; no fake zero totals |
| Empty | Explain why empty and offer one permitted next action |
| Validation error | Attach message to field and provide summary/focus movement |
| Conflict | Preserve safe input, refresh contested state, explain next action |
| Unauthorized | Reveal no protected content; distinguish sign-in from lack of access |
| Offline/stale | Show last successful refresh and prevent false confirmation |
| Background pending | Show stable operation reference and safe retry behavior |
| Success | Name the resulting state, identifier, financial effect, and next action |

## Confirmation hierarchy

- Ordinary reversible changes use inline save and a success result.
- Sensitive actions require a focused confirmation with consequence and reason.
- Destructive-looking actions that actually preserve history say what is
  retained.
- Typing a phrase is reserved for rare ownership/business-level actions, not
  routine cancellation or refund.
