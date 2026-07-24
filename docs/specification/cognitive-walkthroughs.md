# Scripted Cognitive Walkthroughs

Status: Phase 2 founder-operated review

## Purpose and limits

These walkthroughs test whether the specification gives each actor a clear next
action without requiring real owner/staff interviews. They are simulated design
reviews, not usability evidence from live users. Their findings refine the
wireframes and become hypotheses to observe during founder simulation and
organic beta.

## Method

For every task step, answer:

1. Will the actor know what outcome they are trying to achieve?
2. Will they notice the correct control or information?
3. Will the label connect the control with the intended outcome?
4. After acting, will they understand the resulting state and any money,
   capacity, or follow-up consequence?

Severity:

| Severity | Meaning |
|---|---|
| Blocker | Actor cannot safely complete the task or may corrupt core truth |
| High | Actor can choose a materially wrong state/money/capacity action |
| Medium | Actor likely hesitates, backtracks, or needs explanation |
| Low | Clarity/polish issue with a safe recovery |

## CW-001: Phone booking during a busy evening

**Fixture:** V-01 Single Football Turf
**Actor:** Booking Staff
**Goal:** Record a 19:00 phone booking with a returning customer and ৳500
advance before another caller takes the slot.

| Step | Expected actor behavior | Walkthrough result |
|---|---|---|
| Start | Use persistent `+ Quick booking` from Today | Clear on desktop/mobile |
| Choose capacity | Select offering/date/slot; see price and advance rule | Clear; slot must display resource even when only one exists |
| Identify customer | Search local-format phone and select tenant-local result | Clear after normalized search/duplicate hint |
| Record advance | Choose cash/manual MFS and enter amount/reference | Clear only if “submitted” and “verified” are distinct |
| Commit | Submit once; system rechecks capacity | Clear when button changes to processing and repeat submit is idempotent |
| Interpret result | See Confirmed or Pending plus exact deadline/due | Clear; generic “Saved” would be insufficient |

**Decisions incorporated:**

- Quick booking has four named steps and retains safe input after a conflict.
- The result names booking state, identifier, paid, due, and next action.
- Manual MFS never appears as verified by default.

## CW-002: Returning badminton group with possible duplicate

**Fixture:** V-02 Multi-Court Badminton
**Actor:** Booking Staff
**Goal:** Book Court 3 for a team contact whose phone matches two records.

| Step | Risk | Walkthrough result |
|---|---|---|
| Search phone | Staff may select wrong duplicate under time pressure | Show side-by-side identifying history, not only two identical names |
| Choose contact | Staff may merge to finish quickly | Booking can continue with selection/new guest; merge is not in quick flow |
| Enter team | Staff may think every player needs an account | “Team/organization” asks only responsible contact and team label |
| Select court | Similar courts can be confused | Court name and offering compatibility appear in slot choice/result |

**Decision:** Duplicate merge stays a manager-only, previewed task outside
booking. A warning must not become a blocker when staff can identify the right
contact safely.

## CW-003: Arrival with due and unverified bKash

**Fixture:** V-03 Mixed-Sport Complex
**Actor:** Booking Staff
**Goal:** Check in a customer whose ৳1,000 mobile-payment claim is awaiting
verification and who still owes ৳500 if verified.

| Step | Risk | Walkthrough result |
|---|---|---|
| Notice arrival | Today could hide the payment exception | Card separately shows booking, attendance, verification, and due |
| Open booking | “Paid ৳1,000” could falsely imply collected | Use “Submitted ৳1,000 — verification pending” |
| Check in | Staff may bypass financial policy unintentionally | Check-in warns/blocks based on policy; override names permission/reason |
| Resolve | Staff needs a manager without losing queue context | Link directly to MFS verification item and return to booking |

**Decision:** No combined status such as `Confirmed & Paid`. The four facts
remain separately visible.

## CW-004: Immediate walk-in

**Fixture:** V-04 Cricket Practice Facility
**Actor:** Booking Staff
**Goal:** Put an anonymous walk-in into an available net, collect cash, and
check in in under one minute.

| Step | Expected behavior | Walkthrough result |
|---|---|---|
| Start | Choose `Walk-in` from Today | Clear |
| Choose slot | Default to now/next valid slot but allow correction | Clear if exact interval/resource is reviewed before commit |
| Customer | Choose anonymous only because business setting permits it | Clear; must not prefill fake phone/name |
| Cash/check-in | Add optional payment and check-in in same flow | Clear when each result is separately recorded |
| Result | Return to Today showing the live session | Clear |

**Decision:** Walk-in is a shortcut over the same booking invariants, not a
separate untracked attendance record.

## CW-005: After-midnight session and shift handover

**Fixture:** V-05 Late-Night Urban Venue
**Actor:** Booking Staff
**Goal:** Finish a 23:30–00:30 session and hand unresolved due to incoming staff.

| Step | Risk | Walkthrough result |
|---|---|---|
| Find booking | Calendar date could split the booking | Today shows exact cross-midnight interval under one operational day |
| Finish session | Completion could move it to the next report date silently | Result retains operational date and actual completion timestamp |
| Close shift | Staff could think unresolved due prevents leaving | Close is allowed with explicit selected handover items |
| Incoming shift | Handover could be mistaken for a transient message | Persistent attention item requires acknowledgement |

**Decision:** Context header always names operational date, and shift closure
does not resolve or hide financial/incident work.

## CW-006: Emergency resource closure

**Fixture:** V-03 Mixed-Sport Complex
**Actor:** Manager
**Goal:** Block an unsafe court immediately and resolve three future bookings.

| Step | Risk | Walkthrough result |
|---|---|---|
| Create block | Manager may assume bookings cancel automatically | Affected-booking count appears before confirmation |
| Protect safety | Waiting for all customer decisions may leave unsafe slot public | Urgent block can commit immediately and create unresolved work |
| Resolve booking | Reassign/cancel consequences may be unclear | Each row offers explicit reassign, venue-cancel, or unresolved state |
| Inform contact | Message may be sent before the new truth commits | Notification is generated only after each resolution commits |
| Review | One booking could be forgotten | Block remains in attention list until affected count is zero |

**Decision:** The block and each booking resolution are related but separate
state transitions.

## CW-007: Financial correction and cash variance

**Fixture:** V-03 Mixed-Sport Complex
**Actors:** Finance/Reports and Manager
**Goal:** Correct a wrong payment and reconcile a ৳200 cash shortage.

| Step | Risk | Walkthrough result |
|---|---|---|
| Locate payment | Search could expose unrelated venues | Search/report remains role and venue scoped |
| Correct | “Edit payment” may destroy history | Only `Reverse` or `Refund` actions exist; original stays visible |
| Recalculate | User may not understand changed due | Preview shows current and resulting net paid/due |
| Reconcile | Variance may be hidden by adding fake payment | Counted cash and variance have their own fields/reason |
| Report | Manager needs source trail | Finance exceptions drill to original/correction and shift close |

**Decision:** Financial correction vocabulary is append-only and reconciliation
never mutates booking payments to force totals to match.

## CW-008: Owner reads Today’s business performance

**Fixture:** V-03 Mixed-Sport Complex
**Actor:** Business Owner
**Goal:** Understand today’s bookings, collected cash, completed service,
outstanding dues, and utilization.

| Step | Risk | Walkthrough result |
|---|---|---|
| Open Reports | A single revenue number could be misleading | Four separate top metrics name their basis |
| Compare | Future advance makes collection differ from today’s service | Explanatory labels and drill-down preserve different populations |
| Utilization | Blocks may distort the denominator | Reserved, played, available, and downtime figures are shown |
| Investigate | Aggregate may be untrustworthy | Each metric is clickable to exact source population |

**Decision:** The design does not present profit in the MVP and does not call
collection or booking value “revenue” without a stated service basis.

## CW-009: Customer public booking on mobile

**Fixture:** V-01 Single Football Turf
**Actor:** Guest Customer
**Goal:** Choose 19:00, verify phone, understand the advance, and confirm.

| Step | Risk | Walkthrough result |
|---|---|---|
| Choose | Customer may mistake unavailable for loading | Loading skeleton, unavailable label, and selectable price are distinct |
| Hold | Customer may not know time is limited | Countdown begins after selection and remains visible in checkout |
| Verify | OTP retry may cause new checkout/hold | OTP is scoped to the existing checkout; limits give safe retry time |
| Review | Full price, advance, and due may be confused | Three labeled amounts and cancellation terms precede commitment |
| Confirm | Slow/repeat tap may duplicate booking/payment | Stable processing state and idempotency |
| Result | Failure may be interpreted as booked | Result says confirmed, pending, expired/not booked, or failed/no record |

**Decision:** Public checkout prioritizes certainty over a celebratory generic
success screen.

## Findings register

| Finding | Severity | Resolution in Phase 2 |
|---|---|---|
| Booking, payment, verification, and attendance could collapse into one status | High | Separate labels and actions on Today/booking detail |
| Quick booking conflict could discard contact/payment input | Medium | Preserve safe input and return to refreshed slot step |
| Emergency block could silently cancel bookings | Blocker | Separate urgent block from explicit affected-booking resolutions |
| After-midnight work could appear on the wrong day | High | Persistent operational-date context and cross-midnight display |
| Manual MFS claim could look collected before review | High | Submitted/verified/rejected states and queue |
| Generic report “revenue” could mix incompatible metrics | High | Separate booking value, collections, service revenue, and dues |
| Staff could merge duplicate customers during a rushed booking | High | Merge removed from quick flow and permissioned preview added |
| Offline cached Today could look live | Blocker | Prominent freshness/offline state; no false mutation confirmation |
| Subscription restriction could appear to erase records | High | Explicit allowed/prohibited actions and preserved-data language |
| Notification could precede the committed truth | High | Durable post-commit notification event and source-state recheck |

## Walkthrough outcome

No remaining finding blocks Phase 3 domain/data architecture. The risks above
are now represented in workflows, acceptance criteria, wireframes,
notifications, or NFRs. They must be repeated as executable founder simulations
after a functional slice exists; that later result will be behavioral evidence,
not merely a specification review.
