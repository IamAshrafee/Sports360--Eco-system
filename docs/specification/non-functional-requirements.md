# MVP Non-Functional Requirements

Status: Phase 2 measurable quality baseline

## How these requirements are used

These are product constraints for Phase 3 architecture and later release
verification. Values marked **working target** are deliberately concrete now
and may change only through a recorded decision supported by architecture cost
or measured evidence.

## Security and tenant isolation

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-SEC-001 | P0 | Every protected read and mutation enforces authenticated business membership, permission, and venue scope on the server. | Authorization integration tests for every endpoint/action |
| NFR-SEC-002 | P0 | Cross-tenant identifiers return a non-enumerating denial and reveal no record existence or content. | Negative tests using two tenants for every protected aggregate/entity family |
| NFR-SEC-003 | P0 | Platform administrators cannot browse ordinary customer, booking, or payment content through normal platform tools. | Platform-role authorization suite |
| NFR-SEC-004 | P0 | Sessions use secure transport, secure cookie/token storage, rotation/revocation strategy, and no secrets in client-visible logs or URLs. | Architecture review, automated headers/config tests, security checklist |
| NFR-SEC-005 | P0 | OTPs expire, are single-flow/single-purpose, have send and verification attempt limits, and use non-enumerating responses. | Abuse, expiry, replay, and rate-limit tests |
| NFR-SEC-006 | P0 | Sensitive actions require explicit permission; configured actions additionally require reason and immutable audit. | Permission matrix and audit integration tests |
| NFR-SEC-007 | P0 | Exports use the same scope as the report, require export permission, expire securely, and are not publicly guessable. | Authorization and signed-download expiry tests |
| NFR-SEC-008 | P0 | Dependencies and production images receive automated vulnerability review; critical exploitable findings block release until resolved or formally accepted. | CI report and release checklist |

## Booking consistency and idempotency

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-REL-001 | P0 | Persistence enforces at most one conflicting capacity reservation for an independent resource interval; application checks alone are insufficient. | Concurrent integration tests with at least 50 competing requests |
| NFR-REL-002 | P0 | Back-to-back intervals use half-open semantics so `[18:00,19:00)` and `[19:00,20:00)` do not conflict. | Boundary unit and database tests |
| NFR-REL-003 | P0 | Booking, payment, refund/reversal, and future provider mutations accept a scoped idempotency key; identical retries return the original logical result and changed payload reuse fails. | Retry tests before, during, and after commit |
| NFR-REL-004 | P0 | Hold/pending expiry is idempotent and safe when the worker and user completion race. | Clock-controlled concurrency tests |
| NFR-REL-005 | P0 | Reschedule, extension, block, and reassignment revalidate capacity in the committing transaction and leave the original state intact on failure. | Concurrency and rollback integration tests |
| NFR-REL-006 | P0 | Background jobs can resume after partial failure without duplicate business, audit, or notification effects. | Fault-injection and retry tests |
| NFR-REL-007 | P0 | Notification failure never rolls back a committed booking/payment; an outbox-equivalent durable handoff prevents silent event loss. | Transaction boundary and worker-failure tests |

## Money and financial integrity

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-FIN-001 | P0 | BDT values use exact integer minor units or fixed decimal; binary floating-point is prohibited for persisted/business calculations. | Type/schema review and fractional calculation tests |
| NFR-FIN-002 | P0 | Each booking retains immutable price and policy snapshots sufficient to reproduce its committed total and obligations. | Snapshot regression tests after configuration changes |
| NFR-FIN-003 | P0 | Payments, reversals, and refunds are append-only linked transactions; ordinary flows never edit/delete successful money history. | Mutation/permission tests and reconciliation checks |
| NFR-FIN-004 | P0 | For every booking, net paid and due derive deterministically from source transactions and booking total; report/drill-down totals reconcile exactly. | Property tests plus fixture reconciliation |
| NFR-FIN-005 | P0 | Manual MFS references, recipient account labels, verification actor/state, and correction history remain traceable without storing prohibited credentials. | Data and workflow integration tests |
| NFR-FIN-006 | P0 | SaaS subscription invoices/payments and venue customer payments use separate ledgers, queries, and totals. | Schema review and negative cross-ledger tests |

## Time and operational-day correctness

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-TIM-001 | P0 | Persist exact instants plus the relevant venue timezone/context; display in `Asia/Dhaka` for the pilot. | Serialization and timezone tests |
| NFR-TIM-002 | P0 | Operational date is an explicit derived/stored business concept and is not assumed equal to UTC or calendar date for after-midnight sessions. | Midnight fixture tests from V-05 |
| NFR-TIM-003 | P0 | DST/timezone libraries and interval logic remain timezone-general even though Bangladesh currently has no DST transition. | Non-Dhaka architecture test fixture |
| NFR-TIM-004 | P0 | Scheduled expiry/reminder jobs compare server-authoritative instants and tolerate delayed execution without producing stale effects. | Fake-clock delayed-worker tests |

## Performance and capacity

Working fixture before organic beta:

- 1 business with 1 active venue;
- 10 resources;
- 120 fixed slots per day;
- 20,000 bookings/year;
- 10,000 tenant-local customer relationships;
- 100,000 payment/audit/operational records combined;
- at least 50 simultaneous attempts for one popular slot.

| Requirement | Priority | Working target | Measurement condition |
|---|---|---|---|
| NFR-PERF-001 | P1 | Today initial useful content ≤ 2.0 s at p95 and ≤ 4.0 s at p99 | Warm production-like service, representative fixture, Bangladesh mobile profile; excludes first DNS/TLS only when measured separately |
| NFR-PERF-002 | P1 | Calendar/availability response ≤ 1.0 s p95 | 7-day availability for up to 10 resources |
| NFR-PERF-003 | P0 | Booking mutation returns committed success/conflict ≤ 1.5 s p95 | Excludes external payment-provider time; includes database capacity protection |
| NFR-PERF-004 | P1 | Tenant-local customer search ≤ 500 ms p95 after user debounce | 10,000-customer fixture |
| NFR-PERF-005 | P1 | Standard owner report ≤ 3.0 s p95; export may become an observable background job | One-year range on working fixture |
| NFR-PERF-006 | P1 | Core public pages achieve useful mobile content ≤ 2.5 s p75 on production measurement when organic traffic is sufficient | Mid-tier mobile and Bangladesh network conditions |
| NFR-PERF-007 | P0 | At 50 simultaneous attempts on one slot, at most one succeeds and all callers receive a bounded result within 5 s | Load/concurrency test |

Performance is measured at the service boundary and with browser interaction
where relevant. A fast UI that later discovers a failed commit does not satisfy
the booking target.

## Availability, backup, and recovery

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-REC-001 | P0 | Production uses automated encrypted database backups with point-in-time recovery or equivalent. | Provider/config inspection |
| NFR-REC-002 | P0 | **Working target:** recovery point objective ≤ 15 minutes and recovery time objective ≤ 4 hours before organic beta. | Timed restore drill into an isolated environment |
| NFR-REC-003 | P0 | A restore drill verifies tenant relationships, booking conflicts, transaction links, audit history, and known report totals, not merely database startup. | Quarterly during beta; before first beta release |
| NFR-REC-004 | P0 | File/export artifacts have defined retention and are reconstructible or backed up according to importance; secure links remain revocable. | Retention/config test |
| NFR-REC-005 | P1 | **Working target:** core monthly service availability ≥ 99.5% during organic beta, excluding announced maintenance, measured externally. | Synthetic checks and incident log |
| NFR-REC-006 | P0 | Deployment rollback or forward-fix procedure preserves schema/data compatibility; destructive migrations require tested backup and staged rollout. | Release rehearsal |

## Privacy, logging, and audit

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-PRV-001 | P0 | Collect only contact, booking, payment-reference, and operational data required by documented workflows; do not store mobile-wallet PINs, OTPs, or credentials. | Data inventory and schema review |
| NFR-PRV-002 | P0 | Logs/telemetry omit or redact OTPs, session secrets, full secure tokens, full transaction references, and unnecessary contact content. | Automated redaction tests and sampled log review |
| NFR-PRV-003 | P0 | Sensitive audit records are append-only for ordinary users and contain actor, tenant, scope, action, subject, time, reason where required, and correlation reference. | Audit schema and authorization tests |
| NFR-PRV-004 | P1 | Customer/export/notification retention periods are configurable in architecture and a documented deletion/anonymization process preserves legally/financially required records. | Data-lifecycle design and rehearsal before beta |
| NFR-PRV-005 | P0 | Production support access, if later introduced, is time-bounded, reasoned, audited, least-privilege, and disabled by default; it is not implied by platform-admin status. | Access-control test and operational review |

This specification defines engineering protections, not a claim of legal
compliance. Applicable Bangladesh privacy, consumer, tax, and payment
obligations require separate qualified review before commercial launch.

## Accessibility, usability, and localization readiness

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-UX-001 | P1 | Core public booking and business Today flows target WCAG 2.2 AA for keyboard access, focus, labels, contrast, error identification, and non-color status meaning. | Automated checks plus manual keyboard/screen-reader task review |
| NFR-UX-002 | P1 | Core workflows work from 320 CSS px width without clipped required actions or desktop-only hover interactions. | Responsive E2E matrix |
| NFR-UX-003 | P1 | A trained staff user can complete the scripted standard booking in under 60 seconds excluding OTP/provider delay. | Timed founder simulation across archetypes |
| NFR-UX-004 | P0 | Every mutation result names whether it succeeded, is pending, conflicted, expired, or failed; uncertain/offline work is never presented as confirmed. | State/error E2E tests |
| NFR-UX-005 | P1 | User-facing text, dates, numbers, and templates are externalizable for later Bangla localization; identifiers and money remain unambiguous in either language. | Internationalization architecture review |
| NFR-UX-006 | P1 | Supported baseline covers current and previous major versions of Chrome/Edge and current mobile Safari; Firefox receives core-flow verification. | Browser test matrix before beta |

## Observability and operations

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-OBS-001 | P0 | Every request/background job has a correlation identifier; business-safe entity references connect errors to audit/events without logging sensitive payloads. | Log/trace integration test |
| NFR-OBS-002 | P0 | Alerts exist for elevated error rate, failed background jobs, backup failure, database capacity, booking-conflict anomaly, and notification backlog. | Alert firing rehearsal |
| NFR-OBS-003 | P1 | Service dashboards expose latency/error/saturation plus booking attempts, conflicts, expiry jobs, payment-verification backlog, and notification outcomes. | Dashboard review with synthetic events |
| NFR-OBS-004 | P0 | Production incidents have severity, timeline, user impact, mitigation, and follow-up record; security events follow a separate restricted path. | Incident template and simulation |
| NFR-OBS-005 | P1 | User-visible support references map to safe internal correlation IDs and never expose stack traces, database IDs where enumerable, or secrets. | Error response tests |

## Maintainability and delivery

| Requirement | Priority | Measurable requirement | Verification |
|---|---|---|---|
| NFR-MNT-001 | P0 | Domain invariants for tenancy, booking conflicts, money, and state transitions live in testable server-side modules rather than UI-only rules. | Architecture/code review |
| NFR-MNT-002 | P0 | Database migrations are versioned, reviewed, repeatable from empty state, and tested against a production-like prior schema. | CI migration job |
| NFR-MNT-003 | P0 | CI blocks merge/release on type/lint failure, unit/integration failure, authorization suite failure, or migration failure. | Protected pipeline |
| NFR-MNT-004 | P1 | Seeded synthetic fixtures reproduce all six Phase 1 venue archetypes without production personal data. | Fixture generation test |
| NFR-MNT-005 | P1 | Feature flags or entitlement checks can withhold incomplete external dependencies such as SMS or gateway adapters without branching core booking truth. | Configuration/integration test |
| NFR-MNT-006 | P0 | Secrets are injected through managed environment configuration, rotated without code changes, and never committed. | Repository scan and deployment review |

## Release-quality gates

Before founder simulation:

- all P0 acceptance criteria pass at the appropriate test layer;
- cross-tenant, cross-venue, role, and export negative suites pass;
- concurrency, exact-money, timezone, expiry, and retry fixtures pass;
- no known critical/high exploitable security issue is left unassessed;
- a backup has restored successfully and fixture totals reconcile;
- core mobile Today and public booking flows pass accessibility/state review;
- monitoring can identify a failed job, unavailable service, and booking error.

Before organic beta, P1 performance, browser, accessibility, recovery, and
operational targets must also pass against the documented working fixture.
