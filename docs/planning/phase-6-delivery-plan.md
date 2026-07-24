# Phase 6 Customer Booking and Pilot SaaS Delivery Plan

Status: Planned; blocked until the Phase 5 exit gate passes.

Last reviewed: 2026-07-24

## Objective

Expose the trusted Phase 5 source of truth to customers through a secure,
mobile-responsive public booking flow, then complete the minimum pilot SaaS
onboarding, entitlement, subscription, and platform-administration behavior.

## Entry gate

Phase 6 may begin only when Phase 5 proves:

- configuration, schedules, price/policy, and internal availability are
  authoritative;
- staff booking and lifecycle are conflict-safe;
- customer/contact and money models are working;
- Today and core reports reconcile;
- the Phase 5 integrated simulation and full verification gate pass.

Public booking must not become a second booking engine or calendar.

## Scope

Included:

- draft/readiness/preview/publish lifecycle;
- public venue, activity, offering, date, price, policy, and live availability;
- public checkout, expiring capacity hold, OTP-scoped phone verification, and
  abuse controls;
- manual-MFS/payment-arrangement completion using Phase 5 money rules;
- atomic hold-to-booking conversion;
- secure booking result/access links;
- in-app attention and provider-neutral transactional notification behavior;
- onboarding checklist, pilot entitlements, manual subscription lifecycle, and
  metadata-only platform administration;
- mobile, accessibility, stale-state, security, and performance refinement.

Excluded:

- discovery marketplace or cross-business search;
- native mobile app, partner API, widgets, custom domains, or white label;
- automatic recurring billing/proration;
- production gateway settlement or automated refunds;
- unofficial WhatsApp/Messenger automation;
- full support impersonation;
- multi-venue pilot UI;
- H1–H3 future capabilities.

## Delivery principles

- Public reads expose only explicitly published projections.
- Public availability is advisory; PostgreSQL revalidates at hold/booking
  commit.
- Customer/public authorization uses narrow checkout or secure-booking
  capabilities, never staff identifiers or tenant membership.
- OTP proves control of one phone route for one purpose; it does not reveal
  broad customer history.
- A hold creates no revenue or booking commitment.
- Hold completion transfers the same capacity claim atomically without a gap.
- Notifications communicate committed truth and never create or undo it.
- Subscription enforcement lives on the server and preserves operational data.
- SaaS billing remains separate from venue booking money.
- Rate limiting combines multiple risk identities and must remain usable on
  shared Bangladesh mobile networks.

## Slice map

| Slice | Customer/business outcome | Primary trace |
|---|---|---|
| P6-00 | Phase 5 exit evidence and public threat model are reconciled | Phase 5 gate; THR-007–010, 026–027 |
| P6-01 | Customer can view one explicitly published venue catalogue and current availability | WF-CFG-002; US-CFG-008; US-PUB-001; AC-CFG-009–010 |
| P6-02 | Selecting a slot creates one bounded, abuse-controlled expiring hold | US-PUB-002; AC-BKG-002, 004–005; THR-026 |
| P6-03 | Customer verifies one checkout phone safely | US-PUB-003; AC-CUS-003; AC-NFR-004 |
| P6-04 | Valid checkout atomically becomes a pending/confirmed booking | WF-PUB-001; US-PUB-004–005; AC-BKG-003; AC-PAY-002–003 |
| P6-05 | Customer receives a narrow secure result and safe expired/conflict states | US-PUB-005–006; AC-AUTH-010; THR-009 |
| P6-06 | Deadline/expiry/reminder jobs and notifications are idempotent | US-NTF-001–004; AC-BKG-005–006; AC-NFR-009 |
| P6-07 | Owner completes onboarding readiness and publishes only when eligible | US-SUB-001–002; AC-CFG-009–010; AC-SUB-001–003 |
| P6-08 | Pilot subscription restriction/reactivation preserves data and ledgers | WF-SUB-001; US-SUB-003–006; AC-SUB-004–009 |
| P6-09 | Platform admin manages tenant metadata without ordinary tenant content | WF-PLT-001; US-SUB-007; AC-AUTH-009 |
| P6-10 | Public/pilot flows pass mobile, accessibility, abuse, performance, and recovery gates | AC-NFR-001–012; NFR-PERF-006–007 |
| P6-11 | Customer and staff channels pass one integrated phase gate | Phase 6 roadmap exit conditions |

## Detailed gates

### P6-01 — Published public catalogue

Deliver:

- readiness validation and explicit publication revision;
- public projection containing only approved contact, venue, activity,
  offering, price/policy summary, and availability fields;
- public routes/API separate from staff authorization;
- cache semantics that never make a stale slot safe to commit;
- mobile catalogue/date/slot interface with unavailable and stale states.

Exit:

- incomplete/draft/unpublished configuration exposes no availability;
- unpublishing prevents new checkout without breaking existing secure booking
  links or staff work;
- no internal notes, customer, staff, audit, cost, or unpublished fields leak.

Implementation-ready brief:
[P6-01 Published Public Catalogue](phase-6/P6-01-published-public-catalogue.md).

### P6-02 — Expiring hold

Deliver:

- public checkout session and constrained hold acquisition;
- server-authoritative expiry;
- active-hold limits by checkout/contact/device/IP/business policy;
- opportunistic and worker-driven explicit release;
- conflict/expired response with safe next actions.

Exit:

- concurrent public/staff attempts still permit at most one active capacity
  owner;
- expiry completion race has one terminal result;
- hold hoarding and slot scraping controls are measurable and configurable.

### P6-03 — Checkout OTP

Deliver:

- purpose-bound OTP request/verify using the existing adapter;
- send/attempt/expiry/rate-limit rules and non-enumerating responses;
- checkout identity binding that cannot link unrelated history;
- clear provider-disabled/degraded behavior.

Exit:

- OTP replay or use against another checkout fails;
- no OTP, phone, token, or provider secret enters logs/analytics;
- shared-network tests avoid a single global-IP denial strategy.

### P6-04 — Checkout completion

Deliver:

- exact price/policy/advance review;
- manual MFS submission or approved pay-at-venue path;
- atomic contact relationship/snapshot, booking, hold transfer, audit, stored
  result, and outbox;
- pending/confirmed outcome based on the saved policy.

Exit:

- completion after expiry creates no booking;
- an equivalent retry returns one logical result;
- provider/notification failure cannot roll back committed booking truth.

### P6-05 — Secure result/access

Deliver:

- high-entropy, purpose-bound, hashed-at-rest booking capability token;
- minimal customer booking representation and allowed actions;
- explicit confirmed/pending/expired/conflicted/failed result screens;
- revocation/expiry/referrer/log/browser-storage protections.

Exit:

- booking reference alone grants no access;
- guessed or unrelated tokens return non-enumerating denials;
- secure result remains usable when external notification delivery fails.

### P6-06 — Notifications and expiry jobs

Deliver:

- logical notification and attempt records;
- result/shareable link and required in-app attention;
- scheduled eligibility recheck, suppression, retry, and deduplication;
- provider ports with fake/capturing adapters; no provider purchase required.

Exit:

- retries create one logical visible effect;
- reschedule/cancel/expiry suppresses stale reminders;
- accepted/delivered/failed states are never mislabelled.

### P6-07–P6-09 — Pilot SaaS

Deliver:

- onboarding milestones and publication checklist;
- centralized entitlement decisions;
- trial/active/past-due/grace/restricted/reactivated lifecycle;
- manual subscription record in a separate ledger;
- metadata-only platform admin commands with explicit permissions and audit.

Exit:

- reaching a limit blocks only new activation and deletes nothing;
- restriction preserves allowed existing-booking work;
- reactivation is idempotent;
- platform admin cannot browse ordinary bookings/customers/payments.

### P6-10–P6-11 — Refinement and integrated gate

Required proof:

- staff and customer requests share accurate availability;
- hot-slot public/staff concurrency and hold-hoarding tests;
- OTP/token/CSRF/CORS/CSP/referrer/rate-limit security suite;
- 320px, keyboard, focus, screen-reader, slow/stale/error paths;
- useful public content performance target and bounded commit response;
- notification/worker/Valkey-loss recovery;
- subscription restriction through direct/old-client API calls;
- backup restore including checkout, booking, token, notification, and
  subscription relations.

## Immediate next action after Phase 5

Run P6-00 entry review, then implement only
[P6-01 Published Public Catalogue](phase-6/P6-01-published-public-catalogue.md).
Do not combine checkout, OTP, holds, or subscription mutation into that first
public slice.
