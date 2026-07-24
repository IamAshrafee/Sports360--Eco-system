# MVP Epics and User Stories

Status: Phase 2 implementation backlog

## How to read this backlog

The epics below describe product outcomes, not technical components. A story is
implementation-ready only when its linked acceptance criteria, actor scope,
workflow, and screen are defined. `P0` is release-blocking, `P1` is required for
the MVP, and `P2` is useful pilot polish.

## EP-IAM: Identity, tenancy, and access

**Outcome:** Each person signs in safely and can act only within the correct
business, role, and venue scope.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-IAM-001 | P0 | Business Owner | As an owner, I want to verify my phone and create a business so that I become its recoverable primary owner. | WF-IAM-001; CFG-001; SUB-001 |
| US-IAM-002 | P0 | Business Owner | As an owner, I want to invite an employee with a fixed profile and venue scope so that access starts only after acceptance. | WF-IAM-002; CFG-008; AUTH-007 |
| US-IAM-003 | P0 | Employee | As an invited employee, I want to verify my identity and accept the invitation so that I can access my assigned workspace. | WF-IAM-002; CFG-008 |
| US-IAM-004 | P0 | Authorized user | As a user, I want every request scoped by my business, role, and venues so that unrelated records are never exposed. | AUTH-001–006; AUTH-012; NFR-003 |
| US-IAM-005 | P0 | Business Owner | As an owner, I want to change or remove employee access safely so that permissions take effect without erasing history. | AUTH-007–008 |
| US-IAM-006 | P1 | Business Owner/Manager | As an authorized leader, I want sensitive actions to require permission and a reason so that accountability is preserved. | AUTH-003; AUTH-005; AUTH-011 |

## EP-CFG: Business and venue configuration

**Outcome:** An owner can create a valid fixed-slot venue whose availability,
prices, policies, and public details resolve predictably.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-CFG-001 | P0 | Business Owner | As an owner, I want Bangladesh defaults and one active venue so that initial setup is fast and locally appropriate. | WF-CFG-001; CFG-001 |
| US-CFG-002 | P0 | Business Owner/Manager | As an authorized configurator, I want to add activities, independent resources, and offerings so that customers can book the correct capacity. | WF-CFG-001; CFG-002 |
| US-CFG-003 | P0 | Business Owner/Manager | As an authorized configurator, I want to define operating hours and fixed slots so that generated availability stays inside the schedule. | WF-CFG-001; CFG-003 |
| US-CFG-004 | P0 | Business Owner/Manager | As an authorized configurator, I want default and recurring prices so that every bookable slot resolves one deterministic BDT price. | WF-CFG-001; CFG-004 |
| US-CFG-005 | P1 | Business Owner/Manager | As an authorized configurator, I want date-specific price overrides so that special days can be priced without changing old bookings. | CFG-005; CFG-012 |
| US-CFG-006 | P1 | Business Owner/Manager | As an authorized configurator, I want amenities and simple priced add-ons so that I can describe facilities and sell non-capacity extras. | WF-CFG-001; CFG-006 |
| US-CFG-007 | P0 | Business Owner | As an owner, I want explicit advance, confirmation, cancellation, and expiry policies so that bookings follow a known policy version. | WF-CFG-001; CFG-007 |
| US-CFG-008 | P1 | Business Owner | As an owner, I want to preview and publish only a complete venue so that public customers never see invalid booking choices. | WF-CFG-002; CFG-009–010; SUB-002 |
| US-CFG-009 | P1 | Business Owner/Manager | As an authorized configurator, I want deactivation and blocks to reveal affected bookings so that no reservation is silently lost. | CFG-011; WF-OPS-004 |

## EP-BKG: Booking and availability

**Outcome:** All booking channels share one conflict-safe lifecycle and preserve
the commercial facts that applied when the booking was made.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-BKG-001 | P0 | Booking Staff | As booking staff, I want to create phone, message, and direct bookings quickly so that every channel enters one calendar. | WF-BKG-001; BKG-001 |
| US-BKG-002 | P0 | System | As the system, I want booking capacity protected atomically so that concurrent requests cannot double-book a resource. | BKG-004; NFR-001–002 |
| US-BKG-003 | P0 | Customer | As a customer, I want a short temporary hold during checkout so that my selected slot is protected while I finish. | WF-PUB-001; BKG-002–005 |
| US-BKG-004 | P0 | Booking Staff/System | As staff, I want pending bookings with visible payment deadlines so that unpaid capacity releases predictably. | WF-BKG-002; BKG-006 |
| US-BKG-005 | P0 | Authorized staff | As staff, I want to reschedule a booking after rechecking capacity, price, and policy so that the change is accurate and traceable. | WF-BKG-003; BKG-008 |
| US-BKG-006 | P1 | Customer/Authorized staff | As an authorized actor, I want to cancel under the active policy so that booking state and financial resolution remain separate. | WF-BKG-004; BKG-009–010 |
| US-BKG-007 | P0 | Booking Staff | As booking staff, I want to check in, start, complete, or mark no-show so that attendance truth does not alter payment truth. | WF-OPS-001; BKG-011–012 |
| US-BKG-008 | P0 | Booking Staff | As booking staff, I want to extend only into free time so that added duration and price never collide with the next booking. | WF-OPS-003; BKG-013–014 |
| US-BKG-009 | P0 | Manager | As a manager, I want to reassign a booking only to a compatible available resource so that emergency moves remain safe. | WF-OPS-005; BKG-015–016; OPS-016 |
| US-BKG-010 | P0 | Authorized user | As an authorized user, I want every booking to retain source, customer/contact, price, policy, and actor snapshots so that history remains truthful. | BKG-001; BKG-008; CFG-012 |

## EP-CUS: Customers and booking contacts

**Outcome:** A booking can identify its responsible contact without forcing
every player to register or collapsing distinct people into one record.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-CUS-001 | P0 | Booking Staff | As booking staff, I want to create a guest customer during booking so that phone bookings do not require account registration. | WF-CUS-001; CUS-001 |
| US-CUS-002 | P1 | Booking Staff | As booking staff, I want tenant-local phone search with Bangladesh normalization so that I can find returning customers. | WF-CUS-001; CUS-002 |
| US-CUS-003 | P1 | Authorized staff | As staff, I want duplicate warnings without automatic merging so that separate people are not combined accidentally. | WF-CUS-001; CUS-005 |
| US-CUS-004 | P0 | Manager | As a manager, I want a previewed and audited customer merge so that history is preserved under one surviving record. | WF-CUS-001; AUTH-011 |
| US-CUS-005 | P1 | Manager | As a manager, I want customer restrictions, notes, and tags so that future staff can apply known booking requirements. | CUS-006 |
| US-CUS-006 | P0 | Staff/Customer | As a booking contact, I want to book for a team, organization, guardian, or participant so that one responsible contact is enough. | WF-CUS-002; CUS-007; CUS-009 |
| US-CUS-007 | P1 | Booking Staff | As booking staff, I want an explicitly anonymous immediate walk-in option so that no false customer account is created. | WF-OPS-002; CUS-008 |
| US-CUS-008 | P1 | Customer | As a verified guest, I want to optionally create an account and link the booking safely so that unrelated history is not exposed. | CUS-003–004; AUTH-010 |

## EP-PAY: Payments, dues, refunds, and reconciliation

**Outcome:** Staff can record how money moved while keeping every payment,
reversal, refund, and remaining due exact and auditable.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-PAY-001 | P0 | Booking Staff | As booking staff, I want to record cash or manual mobile payments against a booking so that paid and due amounts stay exact. | WF-PAY-001; PAY-001–006 |
| US-PAY-002 | P0 | System | As the system, I want fixed and percentage advance requirements calculated exactly so that confirmation follows the saved policy. | PAY-002–003; NFR-006 |
| US-PAY-003 | P0 | Booking Staff | As booking staff, I want to add multiple partial payments rather than overwrite a balance so that transaction history remains complete. | WF-PAY-001; PAY-004 |
| US-PAY-004 | P0 | Authorized staff | As staff, I want check-in to warn or block when money is due and record any permitted override reason. | WF-OPS-001; PAY-005 |
| US-PAY-005 | P0 | Booking Staff/Manager | As staff, I want manual bKash/Nagad references verified or rejected so that unverified claims are distinguishable from collected money. | WF-PAY-002; PAY-006–007 |
| US-PAY-006 | P0 | Manager/Finance | As an authorized financial user, I want to reverse an incorrect payment without deleting it so that the correction remains traceable. | WF-PAY-003; PAY-008 |
| US-PAY-007 | P0 | Manager/Finance | As an authorized financial user, I want to record partial or full refunds against original payments so that net paid recalculates correctly. | WF-PAY-004; PAY-009–010 |
| US-PAY-008 | P0 | System | As the system, I want idempotent payment processing so that retries and future provider callbacks cannot duplicate money. | PAY-011; NFR-002; NFR-009 |
| US-PAY-009 | P0 | Booking Staff/Finance | As a shift closer, I want expected and counted cash compared with explained variance so that handover totals can be reconciled. | WF-PAY-005; PAY-012 |

## EP-OPS: Today workspace and venue operations

**Outcome:** Venue staff can run the current operational day from one
mobile-friendly workspace, including irregular and degraded situations.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-OPS-001 | P0 | Booking Staff | As booking staff, I want Today to separate current, upcoming, pending, due, late, and blocked items so that I know what needs attention. | WF-OPS-001; OPS-001 |
| US-OPS-002 | P1 | Booking Staff | As booking staff, I want a minimal walk-in flow so that an immediately available slot can be booked, paid, and checked in quickly. | WF-OPS-002; OPS-002 |
| US-OPS-003 | P1 | Booking Staff | As booking staff, I want late and no-show actions to preserve the original reserved interval so that utilization remains truthful. | WF-OPS-003; OPS-003–004 |
| US-OPS-004 | P0 | Manager | As a manager, I want to block a resource interval and resolve affected bookings so that unsafe capacity disappears without silent cancellation. | WF-OPS-004; OPS-005–007 |
| US-OPS-005 | P1 | Booking Staff | As booking staff, I want to mark add-on fulfillment so that sold extras have a clear operational status. | OPS-008 |
| US-OPS-006 | P1 | Employees | As outgoing staff, I want to hand over unresolved dues, incidents, and tasks so that the next shift acknowledges them. | WF-OPS-006; OPS-009; OPS-015 |
| US-OPS-007 | P1 | Authorized staff | As authorized staff, I want restricted incident notes so that sensitive operational context is visible only to permitted roles. | OPS-010 |
| US-OPS-008 | P0 | Staff/System | As staff, I want after-midnight sessions assigned to the intended operational day so that calendar and reporting meaning remain clear. | OPS-011; NFR-005 |
| US-OPS-009 | P0 | Booking Staff | As booking staff with weak connectivity, I want freshness shown and uncertain mutations withheld from confirmation so that stale data cannot create false certainty. | OPS-012–013 |
| US-OPS-010 | P1 | System | As the system, I want operational jobs and alerts retried without duplicate visible effects so that temporary failures are recoverable. | OPS-014; NFR-009 |

## EP-RPT: Owner reports and auditability

**Outcome:** Authorized users can reconcile operational and financial metrics
to their source records without cross-tenant or cross-venue leakage.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-RPT-001 | P0 | Owner/Finance | As an owner, I want Today’s booking value, collections, dues, and service revenue separated so that unlike metrics are not confused. | WF-RPT-001; RPT-001–004 |
| US-RPT-002 | P0 | Owner/Manager | As an owner, I want reserved occupancy and downtime calculated from available capacity so that utilization has an explainable denominator. | WF-RPT-001; RPT-005–007 |
| US-RPT-003 | P1 | Owner/Manager | As an owner, I want booking performance grouped by source so that channel behavior is visible. | RPT-008 |
| US-RPT-004 | P0 | Owner/Finance | As an owner, I want discounts, refunds, reversals, dues, and variances to drill into actor, reason, and source records. | WF-RPT-002; RPT-009 |
| US-RPT-005 | P1 | Owner/Manager | As an owner, I want new and returning customer counts based on a stated completed-booking definition. | RPT-010 |
| US-RPT-006 | P0 | Authorized reporter | As a report user, I want every query and export tenant-, venue-, and role-scoped so that sensitive data stays restricted. | AUTH-004; AUTH-012; RPT-011–012 |
| US-RPT-007 | P1 | Authorized reporter | As a report user, I want filtered CSV exports to preserve the report context so that offline review is explainable. | WF-RPT-002 |
| US-RPT-008 | P0 | Authorized user | As an authorized user, I want protected audit history for sensitive mutations so that the original and resulting state can be reconstructed. | NFR-007; AUTH-005; AUTH-007; AUTH-011 |

## EP-PUB: Public booking

**Outcome:** A customer can discover one venue’s published offerings and submit
a verified, conflict-safe booking without learning private business data.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-PUB-001 | P1 | Customer | As a customer, I want to view published venue details, offerings, prices, and available dates on mobile so that I can choose confidently. | WF-CFG-002; CFG-010 |
| US-PUB-002 | P0 | Customer | As a customer, I want to select a live available slot and receive a temporary hold so that checkout has a fair completion window. | WF-PUB-001; BKG-002 |
| US-PUB-003 | P0 | Customer | As a customer, I want phone verification rate-limited and attached only to my pending checkout so that the booking is secure. | WF-PUB-001; CUS-003; NFR-004 |
| US-PUB-004 | P0 | Customer | As a customer, I want the required advance and cancellation terms shown before confirmation so that the commitment is explicit. | WF-PUB-001; CFG-007; PAY-002–003 |
| US-PUB-005 | P0 | Customer | As a customer, I want a secure booking result and later access to only my own booking so that I can check status without exposing others. | AUTH-010; BKG-003 |
| US-PUB-006 | P1 | Customer | As a customer, I want expired, unavailable, or failed checkout states explained with safe next actions so that I do not assume a booking exists. | BKG-004–006; OPS-012 |

## EP-SUB: SaaS onboarding, subscription, and platform operations

**Outcome:** A business can move from draft to active service while a platform
administrator manages entitlement state without entering ordinary venue work.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-SUB-001 | P0 | Business Owner | As an owner, I want setup progress and a publication checklist so that I know what remains before going live. | WF-IAM-001; WF-CFG-002; SUB-001–002 |
| US-SUB-002 | P0 | Business Owner | As an owner, I want entitlement limits to block only new activation and preserve existing data so that limits are safe and understandable. | WF-SUB-001; SUB-003; SUB-008 |
| US-SUB-003 | P0 | Business Owner | As an owner, I want visible active, past-due, grace, restricted, and suspended states so that permitted actions are predictable. | WF-SUB-001; SUB-005–006 |
| US-SUB-004 | P0 | Business Owner | As an owner, I want reactivation to restore entitlements without data recreation so that service recovery is straightforward. | WF-SUB-001; SUB-007 |
| US-SUB-005 | P0 | Owner/Finance | As a business user, I want SaaS invoices kept separate from venue booking payments so that the two ledgers never mix. | SUB-009 |
| US-SUB-006 | P1 | Platform Administrator | As a platform administrator, I want to grant or extend pilot access with a reason and period so that manual commercial decisions are auditable. | WF-PLT-001; SUB-004 |
| US-SUB-007 | P0 | Platform Administrator | As a platform administrator, I want tenant metadata and safe administrative actions without ordinary customer-data access so that support respects isolation. | WF-PLT-001; AUTH-009 |

## EP-NTF: Transactional notifications

**Outcome:** People receive timely, deduplicated operational information while
the application remains the source of truth.

| Story | Priority | Actor | User story | Workflow and scenario sources |
|---|---|---|---|---|
| US-NTF-001 | P1 | Customer | As a booking contact, I want booking confirmation, change, cancellation, and reminder information so that I know the current commitment. | WF-BKG-001–004; WF-PUB-001 |
| US-NTF-002 | P1 | Authorized staff | As venue staff, I want alerts for expiring reservations, unverified payments, affected bookings, and urgent handover items so that exceptions receive attention. | WF-BKG-002; WF-PAY-002; WF-OPS-004; WF-OPS-006 |
| US-NTF-003 | P0 | System | As the system, I want retries and idempotency to prevent duplicate visible notifications so that delivery failure does not cause contradictory actions. | OPS-014; NFR-009 |
| US-NTF-004 | P0 | System | As the system, I want notification failure recorded without undoing a successful booking or payment so that delivery and business truth remain separate. | Minimum reliability; WF-PUB-001 |

## Backlog readiness rule

A story can enter implementation only when:

1. its actor and venue scope are unambiguous;
2. its P0/P1 acceptance criteria exist;
3. state, money, time, audit, and notification effects are specified where
   relevant;
4. its required screen or background behavior is identified;
5. deferred-product assumptions are not silently implemented; and
6. test fixtures exist in at least one synthetic venue archetype.
