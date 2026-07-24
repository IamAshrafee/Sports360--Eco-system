# Screen Inventory and Navigation

Status: Phase 2 information architecture baseline

## Product surfaces

The MVP has three deliberately separate surfaces:

1. **Business app** — owner, manager, booking staff, and finance work.
2. **Public booking** — customer-facing published venue and booking flow.
3. **Platform administration** — restricted tenant and entitlement operations.

They may share identity and design foundations, but they do not share navigation
or imply shared data permission.

## Business-app navigation

### Primary navigation

| Item | Primary users | Purpose |
|---|---|---|
| Today | Owner, Manager, Booking Staff | Run current venue operations |
| Calendar | Owner, Manager, Booking Staff | Find capacity and manage bookings |
| Customers | Owner, Manager, Booking Staff | Search customer relationships and history |
| Payments | Owner, Manager, Finance | Verify, reconcile, refund, and reverse |
| Reports | Owner, Manager, Finance | Review operational and financial results |
| Setup | Owner, permitted Manager | Configure venue, availability, prices, and policies |
| Team & access | Owner | Invite and scope employees |
| Subscription | Owner | View SaaS status, limits, and invoices |

The interface hides unavailable navigation for clarity, but every destination
and action still enforces permission on the server.

### Active context

The header always identifies:

- current business;
- current venue;
- operational date where relevant;
- connectivity/freshness state;
- signed-in person and access profile.

The pilot permits one active venue, but a venue context is still present so the
architecture and report meaning remain multi-venue safe.

## Business-app screens

Conceptual routes describe information structure, not a framework commitment.

| Screen | Priority | Route | Main actors | Purpose | Workflow/story sources |
|---|---|---|---|---|---|
| SCR-IAM-001 Sign in | P0 | `/sign-in` | All registered users | Phone entry, OTP request, verification, safe retry | US-IAM-001; AC-NFR-004 |
| SCR-IAM-002 Registration | P0 | `/register` | New owner | Verify identity and create initial business | WF-IAM-001; US-IAM-001 |
| SCR-IAM-003 Invitation acceptance | P0 | `/invite/:token` | Invited employee | Verify invitation, identity, profile, and scope before acceptance | WF-IAM-002; US-IAM-003 |
| SCR-CFG-001 Setup overview | P0 | `/setup` | Owner, Manager | Show setup progress, blockers, and safe next step | US-SUB-001 |
| SCR-CFG-002 Business basics | P0 | `/setup/business` | Owner | Name, contact, BDT, timezone, operational-day settings | US-CFG-001 |
| SCR-CFG-003 Venue basics | P0 | `/setup/venue` | Owner, Manager | Venue identity, address, contacts, public description | US-CFG-001 |
| SCR-CFG-004 Activities & resources | P0 | `/setup/resources` | Owner, Manager | Create activities and independent playable resources | US-CFG-002 |
| SCR-CFG-005 Offerings | P0 | `/setup/offerings` | Owner, Manager | Connect customer-facing service to activity/resources/duration | US-CFG-002 |
| SCR-CFG-006 Schedule & slots | P0 | `/setup/schedule` | Owner, Manager | Configure opening hours and fixed slots with preview | US-CFG-003 |
| SCR-CFG-007 Prices | P0 | `/setup/prices` | Owner, Manager | Default, recurring, and special-date rates | US-CFG-004–005 |
| SCR-CFG-008 Policies | P0 | `/setup/policies` | Owner | Advance, confirmation, hold, pending, and cancellation rules | US-CFG-007 |
| SCR-CFG-009 Amenities & add-ons | P1 | `/setup/extras` | Owner, Manager | Describe amenities and configure priced extras | US-CFG-006 |
| SCR-CFG-010 Preview & publish | P1 | `/setup/publish` | Owner | Validate, preview, publish, or unpublish public booking | WF-CFG-002; US-CFG-008 |
| SCR-IAM-004 Team & access | P0 | `/team` | Owner | List memberships, invitations, profiles, and venue scopes | US-IAM-002; US-IAM-005 |
| SCR-IAM-005 Invite/edit employee | P0 | `/team/:membershipId` | Owner | Invite, change scope/profile, suspend, or remove access | WF-IAM-002; AUTH-007–008 |
| SCR-OPS-001 Today | P0 | `/today` | Owner, Manager, Booking Staff | Operational timeline, exceptions, next actions, quick booking | WF-OPS-001; US-OPS-001 |
| SCR-BKG-001 Calendar | P0 | `/calendar` | Owner, Manager, Booking Staff | Resource/date capacity grid with booking and block states | US-BKG-001–002 |
| SCR-BKG-002 Quick booking | P0 | `/calendar?create=1` | Owner, Manager, Booking Staff | Create staff-assisted booking in a drawer/sheet | WF-BKG-001; US-BKG-001 |
| SCR-BKG-003 Booking detail | P0 | `/bookings/:id` | Authorized business users | Canonical booking facts, lifecycle, money, contact, and audit | US-BKG-005–010 |
| SCR-BKG-004 Reschedule/reassign | P0 | `/bookings/:id/reschedule` | Owner, Manager, permitted Staff | Compare valid targets and commit one conflict-safe change | WF-BKG-003; WF-OPS-005 |
| SCR-BKG-005 Cancellation resolution | P1 | `/bookings/:id/cancel` | Authorized staff | State reason, policy result, refund/due follow-up | WF-BKG-004 |
| SCR-OPS-002 Walk-in | P1 | `/today?walkIn=1` | Booking Staff | Minimal immediate booking, payment, and check-in | WF-OPS-002 |
| SCR-OPS-003 Resource blocks | P0 | `/operations/blocks` | Owner, Manager | Create/resolve blocks and affected bookings | WF-OPS-004 |
| SCR-OPS-004 Issue & incident detail | P1 | `/operations/issues/:id` | Permitted staff | Record maintenance/incident context and resolution | US-OPS-004; US-OPS-007 |
| SCR-OPS-005 Shift close & handover | P1 | `/operations/handover` | Booking Staff, Manager | Reconcile open work, note exceptions, acknowledge next shift | WF-OPS-006 |
| SCR-CUS-001 Customer search | P1 | `/customers` | Owner, Manager, Booking Staff | Phone/name search, duplicate hints, restriction markers | WF-CUS-001 |
| SCR-CUS-002 Customer detail | P1 | `/customers/:id` | Authorized business users | Contact, booking history, notes, tags, restrictions | US-CUS-001–006 |
| SCR-CUS-003 Customer merge | P1 | `/customers/merge` | Manager | Preview conflicts, choose survivor, confirm with reason | US-CUS-004 |
| SCR-PAY-001 Payment capture | P0 | `/bookings/:id/payment` | Authorized staff | Record cash/manual MFS transaction and reference | WF-PAY-001 |
| SCR-PAY-002 MFS verification queue | P0 | `/payments/verification` | Manager, permitted Staff | Review submitted manual references and duplicates | WF-PAY-002 |
| SCR-PAY-003 Payment detail | P0 | `/payments/:id` | Manager, Finance | View immutable transaction and linked corrections | WF-PAY-003–004 |
| SCR-PAY-004 Refund/reversal | P0 | `/payments/:id/correct` | Manager, Finance | Choose permitted correction, allocation, and reason | WF-PAY-003–004 |
| SCR-PAY-005 Cash reconciliation | P0 | `/payments/reconciliation` | Booking Staff, Manager, Finance | Compare expected/counted cash and review variance | WF-PAY-005 |
| SCR-RPT-001 Owner overview | P0 | `/reports` | Owner, Manager, Finance | Booking value, collections, service revenue, dues, exceptions | WF-RPT-001 |
| SCR-RPT-002 Booking report | P1 | `/reports/bookings` | Authorized reporters | Filter and drill by date, resource, status, and source | US-RPT-001; US-RPT-003 |
| SCR-RPT-003 Finance report | P0 | `/reports/finance` | Owner, Finance | Collections, dues, discounts, refunds, reversals, variance | WF-RPT-002 |
| SCR-RPT-004 Utilization report | P0 | `/reports/utilization` | Owner, Manager | Reserved/played utilization and downtime denominator | US-RPT-002 |
| SCR-RPT-005 Customer report | P1 | `/reports/customers` | Owner, Manager | New/returning definition and source records | US-RPT-005 |
| SCR-RPT-006 Audit report | P0 | `/reports/audit` | Owner, permitted Manager/Finance | Filter protected sensitive-action history | US-RPT-008 |
| SCR-SUB-001 Subscription | P0 | `/subscription` | Owner | State, entitlement usage, warnings, invoices, next action | WF-SUB-001 |
| SCR-SUB-002 Usage resolution | P0 | `/subscription/usage` | Owner | Resolve over-limit active items without deletion | US-SUB-002 |

## Public-booking screens

| Screen | Priority | Conceptual route | Purpose | Workflow/story sources |
|---|---|---|---|---|
| SCR-PUB-001 Venue page | P1 | `/v/:slug` | Published venue information, activities, offerings, policies | US-PUB-001 |
| SCR-PUB-002 Availability | P0 | `/v/:slug/book` | Date/offering/resource choice and live available slots | US-PUB-002 |
| SCR-PUB-003 Booking details | P0 | `/v/:slug/book/details` | Responsible contact, team/organization, optional add-ons | WF-PUB-001; US-CUS-006 |
| SCR-PUB-004 Phone verification | P0 | `/v/:slug/book/verify` | Rate-limited OTP and hold-expiry context | US-PUB-003 |
| SCR-PUB-005 Review & commitment | P0 | `/v/:slug/book/review` | Price, required advance, policy, expiry, explicit confirmation | US-PUB-004 |
| SCR-PUB-006 Booking result | P0 | `/booking-result/:token` | Confirmed/pending/failed/expired result and safe next action | US-PUB-005–006 |
| SCR-PUB-007 Secure booking view | P1 | `/b/:secureToken` | Current status, due, venue instructions, permitted actions | AUTH-010; US-PUB-005 |

## Platform-administration screens

| Screen | Priority | Conceptual route | Purpose | Workflow/story sources |
|---|---|---|---|---|
| SCR-PLT-001 Tenant list | P1 | `/platform/tenants` | Search platform metadata and state without customer content | WF-PLT-001 |
| SCR-PLT-002 Tenant administration | P0 | `/platform/tenants/:id` | Subscription/entitlement metadata and safe admin actions | AUTH-009; US-SUB-007 |
| SCR-PLT-003 Entitlement adjustment | P1 | `/platform/tenants/:id/entitlements` | Grant/extend pilot with reason and effective period | SUB-004 |
| SCR-PLT-004 Platform audit | P0 | `/platform/audit` | Review administrator actions and security-relevant events | WF-PLT-001 |

## Cross-screen navigation rules

1. **Today is operational home.** After sign-in, business users land on Today
   unless setup or subscription state requires a blocking next action.
2. **Context is preserved.** A booking opened from Today, Calendar, Customer, or
   Report keeps its originating date/filter so Back returns to the same view.
3. **One canonical booking detail.** Every booking link opens
   `SCR-BKG-003`; actions use focused sheets/pages and return to that record.
4. **Sensitive actions are explicit.** Refund, reversal, merge, access change,
   cancellation, and venue-caused resolution never occur from an unlabeled
   icon or a single accidental tap.
5. **Mobile first, desktop enhanced.** Tables become cards or horizontal
   schedule regions; every critical action remains available without hover.
6. **State is textual.** Color reinforces status but does not replace labels,
   icons with names, amounts, deadlines, or conflict explanations.
7. **Permission-aware empty states.** A user is told whether there are no
   records, no venue selection, no permission, a setup blocker, or a loading
   failure; those states are never visually identical.
8. **No public-to-staff shortcut.** Public booking tokens cannot open the
   business app. Business users reaching public pages receive the same public
   representation as customers.

## Responsive behavior

| Width/context | Navigation | Primary content behavior |
|---|---|---|
| Small mobile | Bottom navigation for top 3–5 allowed items; remaining items in More | Single column, sticky primary action, sheets for quick tasks |
| Large mobile/tablet | Compact sidebar or bottom navigation | Timeline/cards; scrollable resource schedule |
| Desktop | Persistent sidebar and context header | Multi-column Today, full calendar grid, side detail panels |

## Screen-level definition of ready

Before implementation, each screen must identify:

- allowed actors and data scope;
- loading, empty, success, error, stale, and permission states;
- destructive/sensitive action confirmation;
- keyboard and mobile behavior;
- mutation idempotency and double-submit treatment;
- audit and notification outcome;
- source workflow, story, and acceptance criteria.
