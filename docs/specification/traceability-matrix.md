# MVP Traceability Matrix

Status: Phase 2 complete

## Purpose

This matrix prevents requirements from being lost between product planning and
engineering. It connects confirmed scope to workflows, stories, acceptance
criteria, screens, notifications, non-functional constraints, and later tests.

## Module traceability

| Module | Product source | Scenario groups | Workflows | Epic/stories | Primary screens/behavior | Supporting requirements |
|---|---|---|---|---|---|---|
| Identity and tenancy | Personas/Roles; SaaS Onboarding | CFG, AUTH, SUB, NFR | WF-IAM-001–002 | EP-IAM; US-IAM-001–006 | SCR-IAM-001–005 | NTF-IAM-001–003; NFR-SEC |
| Venue configuration | Business and Facility Model | CFG, AUTH | WF-CFG-001–002 | EP-CFG; US-CFG-001–009 | SCR-CFG-001–010 | NFR-TIM; NFR-FIN-002 |
| Availability and booking | Booking Lifecycle | BKG, NFR | WF-BKG-001–004 | EP-BKG; US-BKG-001–010 | SCR-BKG-001–005 | NTF-BKG; NFR-REL |
| Customers and contacts | Customers/Players/Teams | CUS, AUTH | WF-CUS-001–002 | EP-CUS; US-CUS-001–008 | SCR-CUS-001–003 | NFR-PRV; NFR-SEC |
| Payments/reconciliation | Pricing/Payments/Finance | PAY, RPT, NFR | WF-PAY-001–005 | EP-PAY; US-PAY-001–009 | SCR-PAY-001–005 | NTF-PAY; NFR-FIN |
| Today operations | Daily Venue Operations | OPS, BKG, PAY | WF-OPS-001–006 | EP-OPS; US-OPS-001–010 | SCR-OPS-001–005 | NTF-OPS; NFR-TIM; NFR-UX |
| Reporting and audit | Reporting and Analytics | RPT, PAY, BKG, AUTH | WF-RPT-001–002 | EP-RPT; US-RPT-001–008 | SCR-RPT-001–006 | NFR-FIN-004; NFR-SEC-007; NFR-PRV-003 |
| Public booking | Booking Lifecycle; Customer Model | BKG, CUS, PAY, NFR | WF-PUB-001 | EP-PUB; US-PUB-001–006 | SCR-PUB-001–007 | NTF-BKG; NTF-PAY; NFR-PERF; NFR-UX |
| Subscription | SaaS Onboarding/Subscriptions | SUB, AUTH | WF-SUB-001 | EP-SUB; US-SUB-001–006 | SCR-SUB-001–002 | NTF-SUB; NFR-FIN-006 |
| Platform administration | SaaS Onboarding/Subscriptions | SUB, AUTH | WF-PLT-001 | EP-SUB; US-SUB-006–007 | SCR-PLT-001–004 | NFR-SEC-003; NFR-PRV-005 |
| Notifications | Booking; Payment; Operations; SaaS | BKG, PAY, OPS, SUB, NFR | Embedded in all workflow groups | EP-NTF; US-NTF-001–004 | Background delivery + in-app attention | NTF-BKG/PAY/OPS/IAM/SUB; NFR-REL-006–007 |

## Actor traceability

| Actor | Workflow areas | Principal screens |
|---|---|---|
| Platform Administrator | PLT, SUB | SCR-PLT-001–004 |
| Business Owner | IAM, CFG, BKG, CUS, PAY, OPS, RPT, SUB | All authorized business screens |
| Manager | CFG, BKG, CUS, PAY, OPS, RPT | Today, Calendar, operational resolution, branch reports |
| Booking Staff | BKG, CUS, PAY, OPS | Today, Calendar, quick booking, customer, payment capture |
| Finance/Reports | PAY, RPT | Verification/corrections, reconciliation, reports |
| Guest Customer | PUB, CUS, PAY | SCR-PUB-001–007 |
| Registered Customer | PUB, CUS, PAY | SCR-PUB-001–007 plus verified own-booking access |
| Team/Organization Contact | PUB, CUS, PAY | Public/staff-assisted contact path and secure booking |
| System/Background Process | BKG, PAY, NTF, SUB, NFR | Expiry, retries, reminders, delivery, monitoring |

## Scenario-to-acceptance coverage

Every Phase 1 P0/P1 scenario has a one-to-one Given/When/Then criterion.

| Source | Scenario IDs | Count | Acceptance IDs | Coverage |
|---|---|---:|---|---|
| Configuration | CFG-001–012 | 12 | AC-CFG-001–012 | Complete |
| Authorization/isolation | AUTH-001–012 | 12 | AC-AUTH-001–012 | Complete |
| Customer | CUS-001–009 | 9 | AC-CUS-001–009 | Complete |
| Booking | BKG-001–016 | 16 | AC-BKG-001–016 | Complete |
| Payment/reconciliation | PAY-001–012 | 12 | AC-PAY-001–012 | Complete |
| Daily operations | OPS-001–016 | 16 | AC-OPS-001–016 | Complete |
| Reporting | RPT-001–012 | 12 | AC-RPT-001–012 | Complete |
| SaaS/entitlements | SUB-001–009 | 9 | AC-SUB-001–009 | Complete |
| Non-functional/failure | NFR-001–012 | 12 | AC-NFR-001–012 | Complete |
| **Total** |  | **110** |  | **110/110** |

## Workflow-to-delivery coverage

| Workflow group | IDs | Stories | Screen/background coverage |
|---|---|---|---|
| Identity | WF-IAM-001–002 | US-IAM-001–006 | SCR-IAM-001–005; account notifications |
| Configuration | WF-CFG-001–002 | US-CFG-001–009 | SCR-CFG-001–010 |
| Booking | WF-BKG-001–004 | US-BKG-001–010 | SCR-BKG-001–005; SCR-OPS-001; NTF-BKG |
| Public booking | WF-PUB-001 | US-PUB-001–006 | SCR-PUB-001–007; hold/expiry background behavior |
| Customers | WF-CUS-001–002 | US-CUS-001–008 | SCR-CUS-001–003 plus embedded contact steps |
| Payments | WF-PAY-001–005 | US-PAY-001–009 | SCR-PAY-001–005; NTF-PAY |
| Operations | WF-OPS-001–006 | US-OPS-001–010 | SCR-OPS-001–005; NTF-OPS |
| Reports | WF-RPT-001–002 | US-RPT-001–008 | SCR-RPT-001–006; export background behavior |
| Subscription | WF-SUB-001 | US-SUB-001–006 | SCR-SUB-001–002; NTF-SUB |
| Platform | WF-PLT-001 | US-SUB-006–007 | SCR-PLT-001–004 |

## Product-outcome coverage

| Pilot outcome | Workflow/story coverage | Acceptance concentration |
|---|---|---|
| Configure venue, resources, schedule, price, policy | WF-CFG-001–002; EP-CFG | AC-CFG; AC-SUB-002 |
| Put every booking channel into one calendar | WF-BKG-001; WF-PUB-001; EP-BKG/EP-PUB | AC-BKG-001–007 |
| Let customer select a live slot | WF-PUB-001; EP-PUB | AC-BKG-002–005; AC-CUS-003 |
| Prevent double booking | WF-BKG-001–003; US-BKG-002 | AC-BKG-004; AC-NFR-001–002 |
| Track advance, partial, due, refund, reversal | WF-PAY-001–005; EP-PAY | AC-PAY-001–012; AC-NFR-006 |
| Operate arrival through completion | WF-OPS-001–006; EP-OPS | AC-BKG-011–016; AC-OPS-001–016 |
| Reconcile trusted owner metrics | WF-RPT-001–002; EP-RPT | AC-RPT-001–012 |
| Safely administer pilot tenants | WF-SUB-001; WF-PLT-001; EP-SUB | AC-SUB-001–009; AC-AUTH-009 |

## Cross-cutting constraint mapping

| Concern | Acceptance sources | NFR family | Design implication |
|---|---|---|---|
| Tenant/venue isolation | AC-AUTH; AC-NFR-003 | NFR-SEC | All queries/mutations server scoped |
| Conflict safety | AC-BKG-002–008, 013–016; AC-NFR-001–002 | NFR-REL | Persistence invariant and committing transaction |
| Exact money | AC-PAY; AC-RPT-001–004, 009; AC-NFR-006 | NFR-FIN | Exact representation, append-only corrections |
| Time/operational date | AC-OPS-011; AC-NFR-005 | NFR-TIM | Instant, timezone, and operational date separated |
| Retry/recovery | AC-PAY-011; AC-OPS-014; AC-NFR-002, 008–009 | NFR-REL; NFR-REC | Idempotency, durable jobs, restore drill |
| Privacy/audit | AC-AUTH; AC-NFR-007, 012 | NFR-PRV | Minimal data, redaction, protected audit |
| Mobile/accessibility | AC-NFR-010–011 | NFR-PERF; NFR-UX | Responsive core and measurable task states |
| Operations | AC-OPS; AC-SUB | NFR-OBS; NFR-MNT | Monitoring, safe releases, failure references |

## Scope-change rule

If architecture or implementation exposes a missing capability:

1. Record the gap and the affected workflow/scenario.
2. Determine whether it is necessary to satisfy existing acceptance behavior.
3. If it changes MVP scope, update the decision log, feature catalogue, MVP
   scope, and affected product documents first.
4. Add or change a story and acceptance criterion only after that decision.
5. Preserve the identifier of superseded behavior in history; do not silently
   repurpose an accepted ID.

## Handoff to Phase 3

Phase 3 must preserve these traceability anchors in the domain/data design:

- business membership + access profile + venue scope;
- independent-resource capacity and half-open intervals;
- separate booking, attendance, payment, verification, and subscription states;
- price/policy/contact snapshots;
- append-only linked money corrections;
- exact time, timezone, and operational date;
- audit, idempotency, notification event, and retry identities;
- drill-down reconciliation from report totals to source records.

No unresolved Phase 2 ambiguity currently blocks domain, data, or technical
architecture. Working targets may be adjusted only through a documented
architecture decision and matching specification update.
