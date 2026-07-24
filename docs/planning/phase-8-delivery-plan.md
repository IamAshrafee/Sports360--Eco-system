# Phase 8 — Organic Beta and Commercial Evidence

Status: Planned; blocked until the Phase 7 exit gate passes.

## Objective

Introduce the proven release candidate to a small, controlled, organic or invitation-based beta; collect privacy-conscious product evidence; operate it safely; and make evidence-led decisions about pricing, payments, and commercial v1.

This phase does not require the solo founder to interview, cold-contact, or recruit venue owners. Participation can come through an owned landing page, self-service interest, trusted introductions, or users who independently request access.

## Entry gate

Phase 8 may start only when:

- the Phase 7 readiness report recommends proceeding;
- critical and high-severity product, security, integrity, and recovery defects are closed;
- production configuration, backups, monitoring, incident response, privacy notice, terms, support contact, and data-retention rules have owners and evidence;
- the beta scope, capacity, rollback conditions, and stop conditions are explicit;
- any deployment, provider purchase, public publication, invitation, or paid activation receives the required user approval before execution.

## Working principles

- Beta status and limitations are communicated honestly.
- Data collection is minimal, purpose-bound, documented, and access-controlled.
- Product evidence is separated from assumptions and anecdotes.
- No dark patterns, fabricated scarcity, inflated traction, or unverified business claims.
- Payment-provider selection waits for actual merchant, settlement, compliance, and integration requirements.
- Laws, provider terms, prices, and platform behavior are reverified when implementation begins.
- Qualified legal or accounting review is recorded as unresolved until genuinely obtained.
- Each rollout step has observable success criteria and a rollback path.

## Delivery slices

### P8-00 — Phase 7 evidence and go/no-go dossier

Freeze the candidate, consolidate Phase 7 evidence, identify blockers, and define the smallest safe beta cohort and operating envelope.

Gate:

- the dossier links every claim to evidence;
- unresolved risks have explicit owners and dispositions;
- go, conditional-go, or no-go is recorded.

### P8-01 — Organic-beta readiness gate

Perform the complete pre-production review without deploying, purchasing, publishing, inviting, or contacting anyone.

Gate:

- product, security, privacy, operations, recovery, accessibility, performance, cost, support, telemetry, and rollback checks have evidence;
- all blockers are explicit;
- the next external action is separately approvable.

Implementation brief: [P8-01 organic-beta readiness gate](./phase-8/P8-01-organic-beta-readiness-gate.md)

### P8-02 — Production environment and controlled deployment

Reverify current provider facts, prepare production secrets and infrastructure, perform recovery checks, deploy the approved candidate, and run smoke tests.

Gate:

- the user explicitly approves external deployment and any cost;
- production data stores, secrets, domains, monitoring, backups, and regional choices match approved architecture;
- smoke, security, rollback, and restore checks pass.

### P8-03 — Controlled organic access and onboarding

Enable a capacity-limited self-service or invitation-based beta with transparent eligibility, onboarding, consent, support, and exit paths.

Gate:

- access limits are enforceable;
- onboarding works without hidden database intervention;
- users can understand beta status, data use, support, and account closure;
- rollback or enrollment pause is immediately available.

### P8-04 — Privacy-conscious telemetry and asynchronous feedback

Measure critical funnels, reliability, and product friction while allowing optional in-product or asynchronous feedback.

Gate:

- every collected event has a documented purpose and retention rule;
- sensitive content and unnecessary personal data are excluded;
- consent and opt-out behavior match the approved policy;
- evidence dashboards cannot expose one tenant to another.

### P8-05 — Production operations and support loop

Operate backups, alerts, incidents, support requests, data corrections, status communication, and provider degradation within the solo-founder capacity.

Gate:

- incidents and support requests have triage and escalation paths;
- recovery drills remain current;
- operator workload and response expectations are measurable and honest;
- repeated operational failures trigger enrollment pause or rollback.

### P8-06 — Evidence review and focused iteration

Review activation, successful booking operations, reliability, support burden, retention signals, and friction; then implement only evidence-supported changes.

Gate:

- evidence is segmented from speculation;
- each accepted change has a measurable intended outcome;
- new scope does not bypass the horizon-promotion process;
- regressions pass the full release gate.

### P8-07 — Transparent pricing and paid continuation

When usage evidence supports it, test a clear price and paid continuation path without manipulative conversion techniques.

Gate:

- the plan, price, taxes/fees assumptions, billing period, cancellation, refund position, and limits are understandable;
- entitlement changes are auditable and reversible;
- manual billing is used only within an explicit safe operating policy;
- no paid activation occurs without the required operational and legal readiness.

### P8-08 — Payment gateway integration

Select and integrate one gateway only after merchant eligibility, Bangladesh settlement behavior, fees, API capabilities, webhook security, refunds, and reconciliation needs are verified.

Gate:

- provider selection is evidence-backed and current;
- idempotency, webhook verification, reconciliation, refunds, and failure recovery pass;
- provider-specific logic remains behind the approved boundary;
- production credentials and financial activation receive explicit approval.

### P8-09 — Commercial policy and compliance readiness

Finalize support terms, privacy and data-processing commitments, subscription policies, acceptable use, retention/deletion, invoicing responsibilities, and incident communication.

Gate:

- product behavior matches published commitments;
- unresolved jurisdictional, tax, legal, or accounting questions are not represented as solved;
- required qualified review is completed or remains a launch blocker.

### P8-10 — Commercial-v1 and horizon decision

Decide whether evidence supports commercial v1, another bounded beta cycle, a pivot, or a stop. Review future horizons independently rather than promoting them by default.

Gate:

- demand, activation, operational reliability, support cost, retention, and payment evidence are summarized honestly;
- commercial readiness and product-market validation claims match actual evidence;
- each proposed horizon capability has a problem statement, evidence, cost, risk, and promotion decision;
- the roadmap and current-state record are updated.

## Stop and rollback conditions

Pause enrollment or roll back when any of these occurs:

- tenant isolation, authorization, or sensitive-data exposure;
- double-booking or unreconciled money movement;
- failed restore or loss of required audit evidence;
- sustained reliability below the approved threshold;
- support or incident load beyond safe solo operation;
- policy, provider, or legal uncertainty that makes continued operation unsafe;
- telemetry collecting data outside its documented purpose.

## Phase completion

Phase 8 is complete only when P8-10 records an evidence-backed decision. A commercial-v1 decision is not automatic: another beta cycle, reduced scope, pivot, or stop are valid outcomes.
