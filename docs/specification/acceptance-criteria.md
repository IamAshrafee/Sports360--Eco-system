# MVP Acceptance Criteria

Status: Phase 2 testable behavior baseline

## Interpretation

Each criterion uses Given/When/Then semantics and maps one-to-one to the 110
Phase 1 scenarios. Unless a criterion says otherwise:

- authorization is enforced by the server, not only the interface;
- times are interpreted in the venue timezone and stored as exact instants;
- BDT values use exact decimal/minor-unit arithmetic;
- successful sensitive mutations record actor, time, reason where required, and
  before/after references;
- failed notification delivery does not reverse a successful business action;
- user-visible errors reveal the corrective action but no unrelated tenant
  information.

## Configuration

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-CFG-001 | P0 | **Given** a phone-verified person without a business, **when** they submit valid business and venue basics, **then** one tenant, owner membership, and draft venue are created atomically with BDT and `Asia/Dhaka` defaults. |
| AC-CFG-002 | P0 | **Given** an authorized draft venue, **when** its owner adds an activity, independent resource, and offering, **then** every relationship belongs to that venue and the offering references at least one compatible active resource. |
| AC-CFG-003 | P0 | **Given** valid venue operating hours, **when** fixed-slot duration and boundaries are configured, **then** generated slots are non-overlapping and none begins before opening or ends after closing. |
| AC-CFG-004 | P0 | **Given** default and recurring prices, **when** availability is requested for a slot, **then** exactly one active rule resolves a deterministic BDT price and its rule source is explainable. |
| AC-CFG-005 | P1 | **Given** a recurring price and valid specific-date override, **when** the matching date is priced, **then** the override wins; other dates and stored booking snapshots remain unchanged. |
| AC-CFG-006 | P1 | **Given** an offering, **when** an amenity and priced add-on are added, **then** the amenity is informational, the add-on has a selectable price and quantity, and neither creates resource capacity. |
| AC-CFG-007 | P0 | **Given** a draft offering, **when** the owner activates advance, confirmation, cancellation, and expiry rules, **then** an explicit policy version is stored and available for booking snapshots. |
| AC-CFG-008 | P0 | **Given** an owner and valid employee phone, **when** the owner sends a scoped profile invitation, **then** no access exists until verified acceptance and the accepted membership is limited to the chosen venues. |
| AC-CFG-009 | P0 | **Given** an incomplete draft venue, **when** publish is requested, **then** publication is rejected with a checklist of missing or invalid requirements and no public availability is exposed. |
| AC-CFG-010 | P1 | **Given** a venue that passes publication checks, **when** the owner previews and confirms publication, **then** only explicitly published venue, offering, price, policy, and availability information becomes public. |
| AC-CFG-011 | P1 | **Given** an active resource with future reservations, **when** deactivation is requested, **then** the affected bookings are listed and deactivation cannot silently cancel or orphan them. |
| AC-CFG-012 | P1 | **Given** existing bookings with price snapshots, **when** an authorized user changes a price rule, **then** newly calculated availability uses the new rule while all historical snapshots remain byte-for-byte financially equivalent. |

## Authorization and isolation

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-AUTH-001 | P0 | **Given** booking staff assigned to one venue, **when** Today is loaded, **then** only that venue’s authorized operational records and aggregates are returned. |
| AC-AUTH-002 | P0 | **Given** a user from another tenant, **when** they request a guessed booking identifier, **then** access is denied with a non-enumerating response and no existence, customer, venue, or state detail leaks. |
| AC-AUTH-003 | P0 | **Given** booking staff without reversal/refund permission, **when** they submit either mutation, **then** it is rejected and an appropriate security or audit signal contains no sensitive payload. |
| AC-AUTH-004 | P0 | **Given** booking staff, **when** customer or financial export is requested, **then** the server denies it even if the export endpoint is called directly. |
| AC-AUTH-005 | P1 | **Given** a manager with permitted branch financial authority, **when** they apply a refund or discount within policy and provide a reason, **then** it succeeds only in scope and the amount, actor, reason, and source are audited. |
| AC-AUTH-006 | P0 | **Given** a Finance/Reports user, **when** they view allowed finance and then call a schedule mutation, **then** finance succeeds while schedule mutation is denied without partial change. |
| AC-AUTH-007 | P0 | **Given** a valid alternative owner/recovery path, **when** the owner changes an employee’s profile, venues, or membership state, **then** new access is effective on the next authorization check and the change is audited. |
| AC-AUTH-008 | P0 | **Given** a business with one primary ownership/recovery path, **when** its removal is requested, **then** the mutation is blocked until a verified transfer or replacement recovery path exists. |
| AC-AUTH-009 | P0 | **Given** a platform administrator, **when** tenant administration is opened, **then** only platform metadata and expressly permitted actions are available; ordinary booking, customer, and payment content is not browsable. |
| AC-AUTH-010 | P1 | **Given** a valid customer secure link or verified account, **when** a booking is opened, **then** only the linked/owned booking is shown and unrelated identifiers return a non-enumerating denial. |
| AC-AUTH-011 | P0 | **Given** a manager with merge permission, **when** they preview and confirm a duplicate merge with a reason, **then** conflicts are shown, one record survives, all history is retained, and an immutable merge audit is created. |
| AC-AUTH-012 | P0 | **Given** any report query, **when** it executes, **then** tenant and allowed-venue predicates are applied before aggregation and drill-down returns exactly the authorized source population. |

## Customers and contacts

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-CUS-001 | P0 | **Given** staff creating a booking, **when** they enter a valid contact without registration, **then** a tenant-local guest relationship and contact snapshot are created and the booking can proceed. |
| AC-CUS-002 | P1 | **Given** a returning customer stored with normalized Bangladeshi phone, **when** staff search using a supported local format, **then** tenant-local matching suggestions appear without cross-tenant results. |
| AC-CUS-003 | P0 | **Given** an unverified public checkout, **when** the correct unexpired OTP is submitted within attempt limits, **then** only that checkout’s phone is verified; excessive sends/attempts are rate-limited safely. |
| AC-CUS-004 | P1 | **Given** a verified guest booking, **when** the customer completes optional account setup through its secure flow, **then** that relationship is linked without automatically revealing unrelated historical guest records. |
| AC-CUS-005 | P1 | **Given** a phone matching a possible tenant-local duplicate, **when** staff create or select a contact, **then** a comparison warning appears and no records are automatically merged. |
| AC-CUS-006 | P1 | **Given** a manager with restriction permission, **when** full-advance restriction is added with a reason, **then** future bookings apply it explicitly while old booking policy snapshots remain unchanged. |
| AC-CUS-007 | P0 | **Given** a team or organization booking, **when** one verified/responsible contact provides the booking details, **then** the booking succeeds without requiring participant accounts. |
| AC-CUS-008 | P1 | **Given** anonymous walk-in is enabled, **when** staff choose it for an immediate booking, **then** the booking is visibly anonymous and no invented name, phone, or registered account is created. |
| AC-CUS-009 | P0 | **Given** a guardian/contact, payer, and participant are different, **when** staff records the booking, **then** each responsibility remains separately attributable and the contact snapshot identifies the responsible communicator. |

## Booking and availability

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-BKG-001 | P0 | **Given** an available fixed slot and authorized staff, **when** a phone/message/direct booking is submitted, **then** one booking stores source, actor, contact, resource, interval, price, and policy snapshots. |
| AC-BKG-002 | P0 | **Given** a publicly available slot, **when** checkout starts, **then** one expiring hold reserves that resource interval and exposes its remaining expiry without creating revenue. |
| AC-BKG-003 | P0 | **Given** a valid unexpired hold, **when** all confirmation requirements complete, **then** the hold is consumed and exactly one pending/confirmed booking is committed atomically. |
| AC-BKG-004 | P0 | **Given** concurrent requests for the same independent resource interval, **when** both commit, **then** at most one capacity-reserving hold/booking succeeds and the loser receives a safe availability response. |
| AC-BKG-005 | P0 | **Given** an incomplete hold past expiry, **when** expiry processing runs or availability is recalculated, **then** capacity is available again and no booking value, payment, or customer commitment is reported. |
| AC-BKG-006 | P0 | **Given** a pending booking with an unmet payment deadline, **when** deadline processing runs idempotently, **then** it expires once, capacity releases, and any later payment follows an explicit late-payment resolution path. |
| AC-BKG-007 | P0 | **Given** one booking ending at 19:00, **when** another starts at 19:00 on the same resource, **then** both succeed because intervals use `[start, end)` semantics. |
| AC-BKG-008 | P0 | **Given** an editable booking and a free target in another rate period, **when** authorized staff confirms reschedule, **then** target capacity is rechecked atomically and old/new interval, price difference, financial effect, actor, and reason are retained. |
| AC-BKG-009 | P1 | **Given** a booking inside a configured customer/staff cancellation policy, **when** cancellation is confirmed, **then** booking state changes once and refund, credit, forfeiture, or due resolution is recorded separately. |
| AC-BKG-010 | P0 | **Given** a resource unavailable due to venue action, **when** a manager venue-cancels a booking, **then** venue reason, affected resource, customer-resolution status, and financial follow-up remain visible. |
| AC-BKG-011 | P1 | **Given** the grace period has passed, **when** staff marks no-show, **then** the original reserved interval stays occupied for reserved-utilization history while played minutes remain zero. |
| AC-BKG-012 | P0 | **Given** a valid booked session, **when** staff check in, start, and complete it in order, **then** attendance timestamps/states change without rewriting booking price or payment transactions. |
| AC-BKG-013 | P0 | **Given** free adjacent time, **when** staff requests an extension, **then** capacity is rechecked at commit, the new end and extra price are stored, and due is recalculated exactly. |
| AC-BKG-014 | P0 | **Given** a following reservation overlaps a requested extension, **when** staff submits it, **then** extension is rejected without changing either booking or capacity. |
| AC-BKG-015 | P1 | **Given** a compatible free alternative resource, **when** a manager confirms reassignment, **then** the new assignment is reserved atomically, pricing impact is explicit, and original assignment/history remains traceable. |
| AC-BKG-016 | P0 | **Given** an incompatible or occupied target resource, **when** reassignment is attempted, **then** it is rejected with the relevant compatibility/availability reason and the original booking is unchanged. |

## Payments and reconciliation

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-PAY-001 | P0 | **Given** an unpaid booking, **when** authorized staff records exact full cash payment, **then** one successful cash transaction exists and net paid equals booking total with zero due. |
| AC-PAY-002 | P0 | **Given** a fixed-advance policy, **when** the exact advance succeeds, **then** confirmation eligibility updates and due equals total minus successful net payments. |
| AC-PAY-003 | P0 | **Given** a percentage-advance policy, **when** the required amount is calculated, **then** the documented rounding rule yields the exact minor-unit amount and confirmation uses that amount. |
| AC-PAY-004 | P0 | **Given** several partial collections, **when** another payment succeeds, **then** a new transaction is appended and net paid is the exact sum of successful payments less linked reversals/refunds. |
| AC-PAY-005 | P0 | **Given** remaining due at check-in, **when** staff attempts check-in, **then** configured policy warns or blocks; an allowed override requires permission and reason and does not falsely mark the balance paid. |
| AC-PAY-006 | P0 | **Given** a manual bKash/Nagad claim, **when** staff records it, **then** method, exact amount, submitted reference, recipient account label, submitting actor, time, and verification state persist. |
| AC-PAY-007 | P1 | **Given** an existing manual reference inside its configured uniqueness scope, **when** the reference is entered again, **then** the duplicate is blocked or flagged for authorized review and never silently counted twice. |
| AC-PAY-008 | P0 | **Given** a mistaken successful manual payment and authorized reviewer, **when** reversal is confirmed with reason, **then** a linked reversal is appended, original remains immutable, and net paid/due recalculate. |
| AC-PAY-009 | P0 | **Given** a refundable successful payment, **when** an authorized user records a partial refund, **then** it links to the original, cannot exceed refundable balance, and updates net paid/due exactly. |
| AC-PAY-010 | P0 | **Given** several successful payments, **when** full refund is allocated, **then** every refund portion remains linked to an original transaction and total allocation equals the approved refund. |
| AC-PAY-011 | P0 | **Given** duplicate or late success from a future payment adapter, **when** its idempotency/provider key is processed, **then** the same logical attempt is returned once and the documented late-success resolution runs without duplicate money. |
| AC-PAY-012 | P0 | **Given** a cash session’s recorded collections, **when** staff enters counted cash and closes, **then** expected, counted, exact variance, note, closer, time, and approval/review state persist. |

## Daily operations

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-OPS-001 | P0 | **Given** assigned venue staff, **when** Today loads, **then** operational-day items are grouped or filterable as current, upcoming, pending, due, late/no-show candidates, and blocked/affected, with next actions. |
| AC-OPS-002 | P1 | **Given** an immediately available slot, **when** staff completes minimal walk-in details, **then** a valid booking is created and optional payment/check-in actions use the same invariants as standard flows. |
| AC-OPS-003 | P1 | **Given** a customer arrives late, **when** staff marks late/check-in, **then** original start and end stay unchanged unless a separate conflict-safe extension succeeds. |
| AC-OPS-004 | P0 | **Given** an existing booking, **when** attendance changes, **then** attendance history updates independently and neither payment state nor booking commercial snapshot changes. |
| AC-OPS-005 | P0 | **Given** a free resource period, **when** a manager creates a block, **then** only the selected resource interval becomes unavailable and the block’s reason, actor, and time are stored. |
| AC-OPS-006 | P0 | **Given** a proposed block intersects bookings, **when** it is submitted, **then** affected bookings and resolution choices are shown; no booking is silently cancelled, moved, or refunded. |
| AC-OPS-007 | P1 | **Given** a maintenance issue, **when** staff reports and later resolves it, **then** description, resource, related block, actors, timestamps, and resolution are retained. |
| AC-OPS-008 | P1 | **Given** priced add-ons on a booking, **when** staff marks quantities fulfilled, **then** fulfillment status changes without creating fake playable-resource reservations. |
| AC-OPS-009 | P1 | **Given** open operational items, **when** one employee hands over to another, **then** the item list, note, sender, recipient, sent time, and acknowledgement time are retained. |
| AC-OPS-010 | P1 | **Given** a restricted incident note, **when** a user without permission requests it, **then** content is withheld; permitted users see its related entity, author, time, and resolution status. |
| AC-OPS-011 | P0 | **Given** a session crosses midnight, **when** it is displayed and reported, **then** exact start/end instants remain intact and one defined venue operational date is shown separately. |
| AC-OPS-012 | P0 | **Given** connectivity is lost after Today was loaded, **when** staff views cached content, **then** last-updated time and offline/stale state are prominent and no unsent mutation is represented as server-confirmed. |
| AC-OPS-013 | P1 | **Given** a provisional offline note/action, **when** connection returns, **then** the server reauthorizes and revalidates current state before applying it; conflicts require explicit resolution. |
| AC-OPS-014 | P1 | **Given** an operational alert delivery failure, **when** the job retries, **then** one logical alert has one visible effect per recipient and attempts remain observable. |
| AC-OPS-015 | P1 | **Given** unresolved due or incidents, **when** shift close is requested, **then** close is allowed only with explicit handover context and unresolved items remain visible to the next authorized shift. |
| AC-OPS-016 | P0 | **Given** emergency closure affects a booking, **when** an authorized manager reassigns or resolves it, **then** capacity, any price difference, financial/customer resolution, notifications, and audit remain mutually consistent. |

## Reports

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-RPT-001 | P0 | **Given** authorized Today records, **when** booking and collection totals are shown, **then** each metric has a stated basis and drill-down totals exactly equal the displayed aggregate. |
| AC-RPT-002 | P0 | **Given** advances for future bookings and unpaid booking value, **when** booking value and collection are compared, **then** they remain separate measures and their difference is not mislabeled as profit or cash variance. |
| AC-RPT-003 | P0 | **Given** pending, future, completed, cancelled, and no-show bookings, **when** completed-service revenue is calculated, **then** only service recognized under the documented completion rule is included. |
| AC-RPT-004 | P0 | **Given** bookings with different due deadlines, **when** dues are reported, **then** due-at-arrival and overdue populations use explicit deadline bases and reconcile to booking balances. |
| AC-RPT-005 | P0 | **Given** available resource minutes and reservations, **when** reserved occupancy is calculated, **then** reserved capacity-minutes divide by available capacity-minutes using the documented interval rules. |
| AC-RPT-006 | P0 | **Given** a resource block, **when** capacity/utilization is calculated, **then** blocked capacity is excluded from availability and displayed separately as downtime. |
| AC-RPT-007 | P1 | **Given** a no-show, **when** reserved and played utilization are compared, **then** its reserved minutes count in reserved utilization and zero minutes count in played utilization. |
| AC-RPT-008 | P1 | **Given** bookings from phone, message, walk-in, direct, and public sources, **when** grouped by source, **then** each booking contributes once according to its immutable source snapshot. |
| AC-RPT-009 | P0 | **Given** discounts, refunds, and reversals, **when** exceptions are reviewed, **then** exact amount, actor, reason, time, booking, and original transaction or price source are drillable. |
| AC-RPT-010 | P1 | **Given** customer histories, **when** new/returning counts are calculated, **then** “new” means the customer’s first completed booking in that business under the documented identity/merge rules. |
| AC-RPT-011 | P0 | **Given** a user without sensitive report/export permission, **when** they call the report or export endpoint, **then** the server denies the request and returns no aggregate or file. |
| AC-RPT-012 | P0 | **Given** an authorized multi-venue fixture, **when** business totals are aggregated, **then** totals equal included venue sources exactly and every drill-down retains venue identity and scope. |

## SaaS and entitlements

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-SUB-001 | P0 | **Given** verified owner registration, **when** a tenant is created, **then** person identity, business ownership, and subscription relationship are distinct linked records. |
| AC-SUB-002 | P0 | **Given** draft configuration, **when** public access is attempted before successful publish, **then** public booking remains unavailable; after publish checks pass, it becomes available without exposing drafts. |
| AC-SUB-003 | P0 | **Given** an active venue/resource/staff entitlement limit is reached, **when** another activation is requested, **then** only that new activation is blocked with limit/remedy information and existing records remain accessible. |
| AC-SUB-004 | P1 | **Given** a platform administrator, **when** pilot access is granted or extended, **then** entitlement, start/end, reason, actor, and time are stored in audit history. |
| AC-SUB-005 | P0 | **Given** a subscription moves from active to past due and grace, **when** users enter the app, **then** the configured warning and permitted-operation set match the current state without mixing venue-payment status. |
| AC-SUB-006 | P0 | **Given** grace expires, **when** restriction activates, **then** data remains intact and the allowed handling of existing bookings is explicit while prohibited new activity is server-blocked. |
| AC-SUB-007 | P0 | **Given** valid subscription payment or administrator reactivation, **when** reactivation commits, **then** entitlements restore idempotently without recreating venue, staff, booking, or financial data. |
| AC-SUB-008 | P0 | **Given** current usage exceeds a lower plan limit, **when** downgrade is requested, **then** no data is deleted and effective downgrade waits for an explicit compliant selection/resolution. |
| AC-SUB-009 | P0 | **Given** SaaS invoices and venue booking transactions, **when** either ledger/report is opened, **then** no record or total from the other ledger is included. |

## Non-functional and failure behavior

| Criterion | Priority | Given / When / Then |
|---|---|---|
| AC-NFR-001 | P0 | **Given** high-concurrency commits for one slot, **when** they reach persistence, **then** a database-enforced capacity invariant allows at most one conflicting capacity reservation. |
| AC-NFR-002 | P0 | **Given** a client repeats a booking/payment mutation with the same idempotency key and equivalent payload, **when** processed, **then** the original logical result is returned without a duplicate effect; a changed payload is rejected. |
| AC-NFR-003 | P0 | **Given** UI controls are bypassed, **when** an unauthorized API mutation is sent, **then** server authorization denies it before protected data is read or changed. |
| AC-NFR-004 | P0 | **Given** abusive OTP/login traffic, **when** configurable identity, IP/device, and flow limits are exceeded, **then** further attempts are throttled with non-enumerating responses, expiry, and observable security events. |
| AC-NFR-005 | P0 | **Given** UTC/local midnight or timezone conversion, **when** time is stored, displayed, filtered, or reported, **then** the instant, `Asia/Dhaka` local time, and defined operational date remain correct. |
| AC-NFR-006 | P0 | **Given** fractional prices, percentages, discounts, payments, and refunds, **when** calculations repeat, **then** exact minor-unit/decimal rules produce deterministic totals without binary floating-point drift. |
| AC-NFR-007 | P0 | **Given** protected audit entries, **when** an ordinary or business user attempts edit/delete, **then** the request is denied and the original audit remains intact. |
| AC-NFR-008 | P0 | **Given** a documented production backup, **when** a restore drill is executed, **then** tenant relations, bookings, capacity, transaction links, and reconciled totals pass integrity checks within the recovery objectives. |
| AC-NFR-009 | P0 | **Given** a background job fails after partial progress, **when** it retries, **then** completed units are recognized idempotently and no duplicate expiry, payment, notification, or audit effect occurs. |
| AC-NFR-010 | P1 | **Given** the documented busy mixed-sport fixture and target device/network, **when** Today loads and filters, **then** the performance budgets in the NFR specification are met before organic beta. |
| AC-NFR-011 | P1 | **Given** a mobile viewport, keyboard, or supported assistive technology, **when** core Today and public-booking tasks are performed, **then** all actions are reachable, focus is visible, labels are announced, and state is not conveyed only by color. |
| AC-NFR-012 | P0 | **Given** an application error involving contact/payment input, **when** logs and telemetry are emitted, **then** OTPs, session secrets, full payment references, and unnecessary personal content are omitted or redacted. |

## Coverage statement

This baseline has exactly one acceptance criterion for every Phase 1 scenario:

| Source group | Covered source IDs | Acceptance IDs |
|---|---|---|
| Configuration | CFG-001–012 | AC-CFG-001–012 |
| Authorization | AUTH-001–012 | AC-AUTH-001–012 |
| Customer | CUS-001–009 | AC-CUS-001–009 |
| Booking | BKG-001–016 | AC-BKG-001–016 |
| Payment | PAY-001–012 | AC-PAY-001–012 |
| Operations | OPS-001–016 | AC-OPS-001–016 |
| Reporting | RPT-001–012 | AC-RPT-001–012 |
| Subscription | SUB-001–009 | AC-SUB-001–009 |
| Non-functional | NFR-001–012 | AC-NFR-001–012 |

Architecture and implementation may split a criterion into several automated
tests, but they may not weaken its observable outcome without a documented
product decision.
