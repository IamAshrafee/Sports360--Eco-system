# MVP Notification Matrix

Status: Phase 2 transactional communication baseline

## Principle

Notifications communicate a recorded result; they do not create that result.
A booking, payment, refund, or subscription transition remains successful even
if delivery fails. The application and secure booking view are the source of
truth.

## Initial delivery strategy

The solo-founder MVP avoids a premature dependency on a paid messaging
provider:

| Channel | MVP treatment |
|---|---|
| In-app inbox/attention list | Required for authorized staff and owners |
| On-screen result | Required immediately after the initiating action |
| Secure/shareable confirmation link | Required; staff or customer can copy/share |
| SMS | Adapter seam and consent data required; provider delivery can be enabled after architecture/commercial validation |
| Email | Optional only when an address is voluntarily provided; not required for booking completion |
| WhatsApp/Messenger | Manual sharing of secure summary/link only; no unofficial automation |

No customer is promised an SMS until a configured provider accepts delivery.
The interface states whether a message was generated, shared manually, queued,
sent, delivered when known, or failed.

## Delivery classes

| Class | Meaning | Retry |
|---|---|---|
| Immediate transactional | Result or urgent change the recipient should know now | Exponential retry within channel limit; same notification key |
| Scheduled transactional | Reminder or deadline warning | Skip if source state no longer qualifies |
| Operational attention | Staff work item shown inside the app | Remains until resolved/dismissed according to type |
| Security/account | Identity or access event | Rate-limited, non-enumerating, never includes secrets |

## Customer booking notifications

| Notification | Trigger | Recipient | Default MVP surface | Timing | Content minimum | Source |
|---|---|---|---|---|---|---|
| NTF-BKG-001 Booking confirmed | Booking atomically enters confirmed | Responsible contact | Result + secure/shareable link | Immediate | Booking ID, venue, resource/offering, local interval, paid/due, policy link | WF-BKG-001; WF-PUB-001 |
| NTF-BKG-002 Booking pending | Booking enters pending | Responsible contact | Result + secure/shareable link | Immediate | Booking ID, reserved interval, exact requirement, deadline, expiry consequence | WF-BKG-002 |
| NTF-BKG-003 Pending deadline warning | Pending requirement remains unmet | Responsible contact; staff attention | Secure view + in-app | Configured before deadline | Exact deadline, amount/action required, safe next step | WF-BKG-002 |
| NTF-BKG-004 Booking expired | Pending/hold-backed commitment expires | Responsible contact where identity was verified; staff attention | Result/secure view + in-app | Immediately after transition | “Not booked/expired,” released interval, late-payment guidance | WF-BKG-002 |
| NTF-BKG-005 Booking rescheduled | Reschedule commits | Responsible contact | Secure/shareable update | Immediate | Old and new interval/resource, price difference, paid/due impact, changer category | WF-BKG-003 |
| NTF-BKG-006 Customer cancellation recorded | Customer/staff cancellation commits | Responsible contact | Secure/shareable update | Immediate | Cancelled interval, policy result, refund/due status, follow-up | WF-BKG-004 |
| NTF-BKG-007 Venue cancellation | Venue-caused cancellation commits | Responsible contact; manager attention | Secure/shareable update + in-app | Immediate/urgent | Venue reason, unavailable session, resolution/refund status, contact instruction | WF-BKG-004; WF-OPS-004 |
| NTF-BKG-008 Resource reassigned | Reassignment commits | Responsible contact | Secure/shareable update | Immediate | New resource, unchanged/changed interval, price effect, venue instruction | WF-OPS-005 |
| NTF-BKG-009 Booking reminder | Booking remains eligible and upcoming | Responsible contact | Secure link; provider channel when enabled | Configurable, default proposal 3 hours before | Venue, local interval, due, arrival instruction, secure link | WF-OPS-001 |
| NTF-BKG-010 No-show recorded | Authorized staff marks no-show | Responsible contact when business policy enables it | Secure view | Immediate | Booking ID, no-show state, any explicit financial consequence/contact path | WF-OPS-003 |

## Payment notifications and attention

| Notification | Trigger | Recipient | Default MVP surface | Timing | Content minimum | Source |
|---|---|---|---|---|---|---|
| NTF-PAY-001 Payment submitted for verification | Manual MFS claim recorded | Responsible contact; verifier attention | Secure view + in-app queue | Immediate | Amount, method, masked reference, “not yet verified” state | WF-PAY-002 |
| NTF-PAY-002 Payment verified | Verification succeeds | Responsible contact; booking staff | Secure view + in-app | Immediate | Exact amount, method, resulting paid/due, booking confirmation state | WF-PAY-002 |
| NTF-PAY-003 Payment rejected | Verification rejects claim | Responsible contact; submitting staff | Secure view + in-app | Immediate | Amount, masked reference, safe reason category, required next action | WF-PAY-002 |
| NTF-PAY-004 Duplicate reference needs review | Possible duplicate detected | Manager/Finance attention | In-app | Immediate | Related booking IDs in authorized scope, masked reference, amounts, submitted actors | WF-PAY-002 |
| NTF-PAY-005 Payment reversed | Authorized reversal commits | Responsible contact when customer-facing balance changes; Finance | Secure view + in-app | Immediate | Reversed amount/method, resulting paid/due, non-sensitive reason summary | WF-PAY-003 |
| NTF-PAY-006 Refund recorded | Refund record commits | Responsible contact; Finance | Secure view + in-app | Immediate | Amount, original method, execution/recorded state, remaining refundable/net paid | WF-PAY-004 |
| NTF-PAY-007 Due at arrival | Booking approaches arrival with due | Responsible contact; staff attention | Secure view + in-app | Configurable before arrival | Exact due, accepted methods, whether check-in warns/blocks | WF-OPS-001 |
| NTF-PAY-008 Cash variance requires review | Shift closes outside configured tolerance | Manager/Finance attention | In-app | Immediate | Shift, expected, counted, variance, closer, note status | WF-PAY-005 |

## Operations notifications and attention

| Notification | Trigger | Recipient | Default MVP surface | Timing | Content minimum | Source |
|---|---|---|---|---|---|---|
| NTF-OPS-001 Upcoming/current action | Booking reaches operational attention window | Assigned venue staff | Today attention | Scheduled | Booking, resource, interval, contact label, due/verification state | WF-OPS-001 |
| NTF-OPS-002 Late/no-show candidate | Arrival grace threshold passes without check-in | Assigned venue staff | Today attention | At threshold | Booking, elapsed time, original end, permitted actions | WF-OPS-003 |
| NTF-OPS-003 Block affects bookings | Block intersects existing reservations | Manager and assigned staff | In-app affected-work queue | Immediate | Resource/interval, number of bookings, unresolved resolution count | WF-OPS-004 |
| NTF-OPS-004 Maintenance issue reported | Issue is created or escalated | Manager; selected staff | In-app | Immediate | Resource, severity category, block state, reporter, next action | WF-OPS-004 |
| NTF-OPS-005 Handover sent | Shift close/handover commits | Selected incoming employee; manager if urgent | In-app | Immediate | Shift, sender, unresolved item counts, acknowledgement action | WF-OPS-006 |
| NTF-OPS-006 Handover unacknowledged | Required acknowledgement remains absent | Incoming employee; manager escalation | In-app | Configured elapsed period | Handover reference, sent time, urgency, outstanding items | WF-OPS-006 |
| NTF-OPS-007 Background operation failed | Expiry/reminder/other job exhausts immediate retry | Platform/operator attention; affected business only if action needed | Internal operational alert | Immediate after threshold | Safe operation reference, tenant/venue identifier, failure class, retry state | NFR-009 |

## Account, access, and subscription notifications

| Notification | Trigger | Recipient | Default MVP surface | Timing | Content minimum | Source |
|---|---|---|---|---|---|---|
| NTF-IAM-001 Employee invited | Valid invitation is created | Invited phone/person | Secure invite link through configured/manual channel | Immediate | Business, profile, venue scope, expiry; no pre-acceptance data | WF-IAM-002 |
| NTF-IAM-002 Access changed | Profile/scope/suspension/removal commits | Affected employee; owner audit/inbox | On next session + in-app | Immediate | Business, effective change, actor category, recovery/support path | WF-IAM-002 |
| NTF-IAM-003 Ownership/recovery changed | Safe ownership/recovery change commits | Old/new owner and platform security attention | In-app/configured account channel | Immediate | Business, effective time, change category, support path | AUTH-008 |
| NTF-SUB-001 Pilot/plan active | Entitlement begins or reactivates | Owner | Subscription screen + in-app | Immediate | State, period, key limits, next billing/manual action | WF-SUB-001 |
| NTF-SUB-002 Approaching expiry/invoice due | Manual subscription due date approaches | Owner | In-app | Proposed 7 days and 1 day before | Due date, amount if invoiced, verification instructions, ledger distinction | WF-SUB-001 |
| NTF-SUB-003 Past due/grace started | State enters past due or grace | Owner; permitted manager banner | In-app banner | Immediate | State, grace end, currently allowed actions, payment/reference path | WF-SUB-001 |
| NTF-SUB-004 Restriction activated | Grace expires | Owner and signed-in business users | Blocking/context banner + inbox | Immediate | Effective state, allowed existing-booking work, prohibited actions, recovery path | WF-SUB-001 |
| NTF-SUB-005 Reactivated | Valid reactivation commits | Owner and signed-in users | In-app | Immediate | Restored state, effective time, limits; no implication that venue payments changed | WF-SUB-001 |
| NTF-SUB-006 Usage limit reached | New activation is blocked by entitlement | Owner | Inline result + subscription attention | At attempted action | Limit, current usage, unchanged existing data, available resolution | WF-SUB-001 |

## Idempotency and suppression

Every notification instance has:

```text
event type + source entity + source transition/version + recipient + channel
```

as its logical deduplication identity.

Rules:

1. Retrying the same event cannot create a second visible in-app item or a
   second provider send with a new logical identity.
2. A scheduled message rechecks source eligibility immediately before sending.
   Cancelled, completed, expired, or rescheduled bookings suppress stale
   reminders.
3. Rescheduling cancels/replaces reminders for the old interval.
4. A changed event, such as a second reschedule, creates a new versioned
   notification and does not edit historical delivery attempts.
5. Provider acceptance, delivery, and reading are separate states; “sent” is
   not represented as “delivered” without evidence.
6. Users cannot dismiss work that still blocks an operational workflow; they
   can acknowledge it or resolve its source.

## Content and privacy rules

- Use the venue’s local time and include date, start, and end.
- Include exact BDT amount and whether it is price, paid, due, refund, or SaaS
  invoice.
- Mask transaction references and phone numbers except where the authenticated
  task genuinely requires the full value.
- Never put OTPs, session tokens, raw secure links, or full references in logs.
- Secure links carry high-entropy revocable tokens and expose only the intended
  booking representation.
- Avoid sensitive incident notes in external channels.
- Transactional messages do not imply marketing consent.
- Preferred language/localization is a future capability; MVP copy is written
  in clear English and prepared for later Bangla translation.

## Notification audit and observability

Store the logical notification, template/version, recipient reference, channel,
eligibility decision, scheduled time, attempt state, provider reference where
available, and final outcome. Ordinary users may not edit delivery history.
Operational metrics must avoid storing full message bodies when event/template
references are sufficient.
