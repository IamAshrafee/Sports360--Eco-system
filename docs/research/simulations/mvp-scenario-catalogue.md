# MVP Scenario Catalogue

Status: Phase 1 simulation baseline

## Purpose

This catalogue describes the minimum normal, exceptional, authorization,
financial, reporting, and reliability behavior the MVP must support.

It is product-level scenario coverage. During detailed specification, every P0
and P1 scenario becomes Given/When/Then acceptance criteria. During engineering,
the appropriate parts become automated unit, integration, authorization,
concurrency, and end-to-end tests.

## Priority

| Priority | Meaning |
|---|---|
| P0 | Safety, tenant isolation, money, or core booking invariant; release blocker |
| P1 | Required ordinary or exception workflow for MVP |
| P2 | Important polish or secondary pilot behavior |

## Actor abbreviations

| Code | Actor |
|---|---|
| PA | Platform Administrator |
| BO | Business Owner |
| MG | Manager |
| BS | Booking Staff |
| FR | Finance/Reports |
| CU | Customer/Player |
| TO | Team/Organization Contact |
| SY | System/background process |

## Configuration scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| CFG-001 | P0 | BO | Create business and first venue after verified sign-in | Tenant and venue exist with Bangladesh defaults and owner membership |
| CFG-002 | P0 | BO | Add activity, independent resource, and offering | Relationships are valid and venue-scoped |
| CFG-003 | P0 | BO/MG | Configure venue hours and fixed slots | Generated slots remain within operating schedule |
| CFG-004 | P0 | BO/MG | Configure default and recurring day/time price | Each slot resolves one deterministic price |
| CFG-005 | P1 | BO/MG | Add a specific-date price override | Override wins over recurring/default without changing history |
| CFG-006 | P1 | BO/MG | Add amenity and priced add-on | Amenity does not reserve capacity; add-on is selectable |
| CFG-007 | P0 | BO | Select advance, confirmation, and cancellation policy | Offering stores explicit active policy/version |
| CFG-008 | P0 | BO | Invite staff with profile and venue scope | Access begins only after accepted verified invitation |
| CFG-009 | P0 | BO | Attempt to publish incomplete venue | Publication is blocked with actionable missing requirements |
| CFG-010 | P1 | BO | Preview and publish complete venue | Public page exposes only published information |
| CFG-011 | P1 | MG | Deactivate resource with future bookings | System warns and requires booking resolution; no silent cancellation |
| CFG-012 | P1 | BO | Change price after bookings exist | Future calculations change; historical snapshots remain unchanged |

## Authorization and isolation scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| AUTH-001 | P0 | BS | Access assigned venue Today | Only permitted venue data is returned |
| AUTH-002 | P0 | BS | Guess another tenant's booking identifier | Request is denied without revealing record existence |
| AUTH-003 | P0 | BS | Attempt unrestricted refund or reversal | Denied and security/audit signal recorded as appropriate |
| AUTH-004 | P0 | BS | Attempt customer or financial export | Denied |
| AUTH-005 | P1 | MG | Perform permitted branch refund/discount | Action succeeds with reason and audit |
| AUTH-006 | P0 | FR | View finance but attempt schedule configuration | Finance data allowed; schedule mutation denied |
| AUTH-007 | P0 | BO | Invite/remove staff and change venue scope | Effective access changes safely and is audited |
| AUTH-008 | P0 | BO | Attempt to remove the only ownership/recovery path | Blocked until valid ownership transfer/recovery exists |
| AUTH-009 | P0 | PA | Use tenant administration without ordinary customer-data access | Only platform-authorized metadata/actions are available |
| AUTH-010 | P1 | CU | Access own booking secure link/account | Own booking visible; unrelated bookings inaccessible |
| AUTH-011 | P0 | MG | Merge duplicate customers | Requires permission, preview, preserved history, and audit |
| AUTH-012 | P0 | SY | Apply every report query with tenant and venue scope | No unauthorized cross-tenant/cross-venue aggregation |

## Customer scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| CUS-001 | P0 | BS | Create guest customer during phone booking | Booking proceeds without registered account |
| CUS-002 | P1 | BS | Search returning customer by local-format phone | Number normalizes and correct tenant-local suggestions appear |
| CUS-003 | P0 | CU | Verify phone by OTP during public booking | Verification is rate-limited and scoped to pending flow |
| CUS-004 | P1 | CU | Finish optional account setup after guest booking | Safe link occurs without exposing unrelated historical records |
| CUS-005 | P1 | BS | Enter phone matching possible duplicate | Warning appears; duplicate is not auto-merged |
| CUS-006 | P1 | MG | Restrict customer to full-advance booking | Future booking applies explicit business-level restriction |
| CUS-007 | P0 | CU | Book as team/organization contact | One responsible contact is sufficient; participants need not register |
| CUS-008 | P1 | BS | Create anonymous immediate walk-in when enabled | Booking is clearly anonymous and creates no false registered customer |
| CUS-009 | P0 | BS | Book for guardian/contact and different participant | Contact, payer, and participant concepts do not collapse |

## Booking scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| BKG-001 | P0 | BS | Create phone/message booking on available fixed slot | Booking uses chosen source, snapshot, customer, and actor |
| BKG-002 | P0 | CU | Start public checkout on available slot | Temporary hold reserves capacity until expiry |
| BKG-003 | P0 | CU/SY | Complete requirement before hold expiry | One confirmed booking replaces/consumes hold atomically |
| BKG-004 | P0 | CU/BS | Concurrently request same resource/time | At most one capacity-reserving result succeeds |
| BKG-005 | P0 | SY | Hold expires without completion | Hold releases and creates no revenue |
| BKG-006 | P0 | BS/SY | Pending reservation misses payment deadline | Booking expires and capacity releases according to policy |
| BKG-007 | P0 | BS | Create bookings 18:00–19:00 and 19:00–20:00 | Back-to-back half-open intervals both succeed |
| BKG-008 | P0 | MG/BS | Reschedule into different rate period | Availability rechecks; price difference and history are explicit |
| BKG-009 | P1 | CU/BS | Customer cancels within configured policy | Booking cancellation and financial result are separate/audited |
| BKG-010 | P0 | MG | Venue cancels because resource is unavailable | Venue-cancellation reason and customer resolution are recorded |
| BKG-011 | P1 | BS | Mark customer no-show after grace period | Reserved occupancy remains; played utilization does not increase |
| BKG-012 | P0 | BS | Check in, start, and finish session | Attendance changes without altering booking/payment truth |
| BKG-013 | P0 | BS | Request extension with free following time | Availability rechecks; extra price/due and new end are recorded |
| BKG-014 | P0 | BS | Request extension overlapping next booking | Extension is rejected; following booking remains unchanged |
| BKG-015 | P1 | MG | Move booking to compatible available resource | New assignment succeeds with price resolution and original history |
| BKG-016 | P0 | MG | Move booking to incompatible or occupied resource | Rejected with reason |

## Payment and reconciliation scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| PAY-001 | P0 | BS | Record full cash payment | Successful exact payment reduces due to zero |
| PAY-002 | P0 | CU/BS | Record fixed advance | Booking can confirm per policy; remaining due is exact |
| PAY-003 | P0 | CU/BS | Record percentage advance | Required amount uses exact configured calculation |
| PAY-004 | P0 | BS | Collect several partial payments | Net paid is sum of successful transactions, not overwritten value |
| PAY-005 | P0 | BS | Check in with remaining balance | Policy warns/blocks or authorized override records reason |
| PAY-006 | P0 | BS | Record manual bKash/Nagad reference | Method, amount, reference, recipient, actor, and verification persist |
| PAY-007 | P1 | BS/MG | Duplicate manual transaction reference is entered | System warns/blocks according to uniqueness scope and requires review |
| PAY-008 | P0 | FR/MG | Correct mistaken manual payment | Reversal links original; record is not deleted |
| PAY-009 | P0 | FR/MG | Partially refund payment | Refund references original and due/net paid recalculate correctly |
| PAY-010 | P0 | FR/MG | Fully refund several payments | Allocations remain traceable to original transactions |
| PAY-011 | P0 | SY | Receive duplicate or late gateway success in future adapter test | Idempotency prevents duplicate money and defined late-success path runs |
| PAY-012 | P0 | BS/FR | Close cash session with counted variance | Expected, counted, variance, note, and approval state persist |

## Daily operation scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| OPS-001 | P0 | BS | Open Today at assigned venue | Current, upcoming, pending, due, late, and blocked items are clear |
| OPS-002 | P1 | BS | Create immediate walk-in and check in | Minimal flow creates valid booking/payment/attendance |
| OPS-003 | P1 | BS | Customer arrives late | Original end remains; late state is visible |
| OPS-004 | P0 | BS | Mark attendance without payment change | Attendance state updates independently |
| OPS-005 | P0 | MG | Block free resource period | Availability updates only for affected resource/interval |
| OPS-006 | P0 | MG | Block period containing bookings | Affected bookings display; no silent cancellation occurs |
| OPS-007 | P1 | BS/MG | Report and resolve maintenance issue | Issue, block relationship, actor, time, and resolution persist |
| OPS-008 | P1 | BS | Fulfill priced add-ons | Quantity/status is recorded without fake resource capacity |
| OPS-009 | P1 | BS | Hand shift to another employee | Open items are recorded and acknowledged |
| OPS-010 | P1 | MG | Record restricted incident note | Related entities link and unauthorized roles cannot view it |
| OPS-011 | P0 | SY/BS | Operate booking across midnight | Exact timestamp and operational day remain distinct |
| OPS-012 | P0 | BS | Lose connection and view cached Today | Freshness is visible; no offline action is shown as confirmed |
| OPS-013 | P1 | BS/SY | Record provisional offline note then reconnect | Server revalidates before any booking confirmation |
| OPS-014 | P1 | SY | Send operational alert once with retry | Retry does not create duplicate visible action |
| OPS-015 | P1 | BS | Close shift with unresolved due/incident | Closure allowed with explicit handover note |
| OPS-016 | P0 | BS/MG | Reassign resource after emergency closure | Capacity, price, customer resolution, and audit stay consistent |

## Reporting scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| RPT-001 | P0 | BO/FR | View Today's booking and collection totals | Every metric drills to source records |
| RPT-002 | P0 | BO/FR | Compare booking value with payments collected | Future advances and dues prevent false equality |
| RPT-003 | P0 | BO/FR | Report completed-service revenue | Pending/future bookings are excluded |
| RPT-004 | P0 | FR | View due-at-arrival versus overdue | Deadline basis is explicit |
| RPT-005 | P0 | BO/MG | Calculate reserved occupancy | Reserved minutes divide by available capacity |
| RPT-006 | P0 | BO/MG | Include resource block in capacity | Block reduces available denominator and downtime is visible |
| RPT-007 | P1 | BO/MG | Compare reserved and played utilization after no-show | Reserved rises; played does not |
| RPT-008 | P1 | BO/MG | Group booking performance by source | Phone/message/walk-in/public remain attributable |
| RPT-009 | P0 | BO/FR | Review discounts, refunds, and reversals | Actor, reason, amount, and source records are visible |
| RPT-010 | P1 | BO/MG | Identify new and returning customers | Definition uses first completed booking |
| RPT-011 | P0 | BS | Attempt sensitive report/export | Role and venue scope are enforced |
| RPT-012 | P0 | BO/FR | Aggregate future multi-venue fixture | Totals equal authorized venue records; drill-down keeps venue context |

## SaaS and entitlement scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| SUB-001 | P0 | BO | Register by verified phone and create tenant | Owner and business subscription relationship are distinct |
| SUB-002 | P0 | BO | Configure draft then publish | Public booking stays unavailable until checks pass |
| SUB-003 | P0 | BO | Reach active venue/resource/staff limit | Existing data remains; new activation is blocked clearly |
| SUB-004 | P1 | PA | Grant/extend pilot access | Entitlement adjustment has reason, period, and audit |
| SUB-005 | P0 | SY/BO | Subscription becomes past due then grace | Operations and owner warnings follow defined progression |
| SUB-006 | P0 | SY/BO | Grace expires into restriction | Data remains; permitted existing-booking operations are explicit |
| SUB-007 | P0 | PA/BO | Payment/reactivation succeeds | Entitlements restore without data recreation |
| SUB-008 | P0 | BO | Downgrade below current usage | No deletion; owner resolves active items before effect |
| SUB-009 | P0 | FR/BO | Compare SaaS invoice with venue booking payments | Ledgers and reports remain completely separate |

## Non-functional and failure scenarios

| ID | Priority | Actor | Scenario | Expected outcome |
|---|---|---|---|---|
| NFR-001 | P0 | SY | High-concurrency requests target same slot | Database invariant permits at most one confirmed reservation |
| NFR-002 | P0 | SY | Client retries booking/payment mutation | Idempotency returns same logical result |
| NFR-003 | P0 | SY | Authorization is bypassed at UI level | Server still denies unauthorized action |
| NFR-004 | P0 | SY | OTP/login endpoint is abused | Rate limiting, expiry, and safe error behavior apply |
| NFR-005 | P0 | SY | Time crosses midnight/timezone boundary | Stored instant, local display, and operational date remain correct |
| NFR-006 | P0 | SY | Add/subtract fractional financial values | Exact representation prevents floating-point drift |
| NFR-007 | P0 | SY | User attempts to edit/delete audit history | Ordinary users cannot mutate protected audit records |
| NFR-008 | P0 | PA/SY | Restore from backup | Tenant records, relationships, and financial totals recover consistently |
| NFR-009 | P0 | SY | Background job fails midway and retries | Processing resumes idempotently without duplicate effects |
| NFR-010 | P1 | SY | Today loads a busy mixed-sport fixture | Performance target is defined and met before organic beta |
| NFR-011 | P1 | CU/BS | Use core booking and Today on mobile/accessibility tools | Content is operable without color-only meaning or desktop-only controls |
| NFR-012 | P0 | SY | Error/logging path receives sensitive contact/payment data | Logs redact or omit prohibited sensitive information |

## Archetype coverage matrix

Legend: **Primary** means the archetype is the main fixture for the group;
**Covered** means scenarios still run where applicable; **Pressure** means
architecture/authorization coverage without pilot UI delivery.

| Archetype | CFG | AUTH | CUS | BKG | PAY | OPS | RPT | SUB | NFR |
|---|---|---|---|---|---|---|---|---|---|
| V-01 Single Turf | Covered | Covered | Covered | Primary | Primary | Covered | Covered | Covered | Primary |
| V-02 Badminton | Covered | Covered | Primary | Primary | Covered | Primary | Primary | Covered | Covered |
| V-03 Mixed Complex | Primary | Primary | Primary | Primary | Primary | Primary | Primary | Primary | Primary |
| V-04 Cricket | Covered | Covered | Primary | Covered | Covered | Primary | Covered | Covered | Covered |
| V-05 Late Night | Covered | Covered | Covered | Covered | Primary | Primary | Primary | Covered | Primary |
| V-06 Multi-Venue | Pressure | Primary | Pressure | Pressure | Pressure | Pressure | Primary | Primary | Primary |

## Expected conversion into specifications

For each P0/P1 scenario, Phase 2 should add:

- Preconditions and fixture
- Given/When/Then acceptance criteria
- Allowed actors and scopes
- State transitions
- User-visible success and error messages
- Audit result
- Notification result
- Exact financial/report result where applicable
- Recovery and retry behavior

## Scope rule

Scenario coverage may reveal a missing MVP behavior. It does not automatically
authorize a new feature. Any scope change must update the decision log, feature
catalogue, MVP scope, and affected product documents.

