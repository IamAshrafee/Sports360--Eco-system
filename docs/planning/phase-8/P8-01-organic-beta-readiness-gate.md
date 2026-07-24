# P8-01 — Organic-Beta Readiness Gate

Status: Implementation-ready review task; blocked until the Phase 8 entry gate passes.

Task type: Read-only review and documentation. No external mutation is authorized.

## Outcome

Produce an evidence-backed go, conditional-go, or no-go recommendation for the smallest safe organic beta, including every blocker, rollout condition, stop condition, approval boundary, and rollback step.

## Read before starting

- [Phase 8 delivery plan](../phase-8-delivery-plan.md)
- [Phase 7 delivery plan](../phase-7-delivery-plan.md)
- Phase 7 readiness report produced by P7-10
- [Non-functional requirements](../../specification/non-functional-requirements.md)
- [Security threat model](../../architecture/security-threat-model.md)
- [Deployment, scaling, and recovery](../../architecture/deployment-scaling-and-recovery.md)
- [Provider cost and exit strategy](../../architecture/provider-cost-and-exit-strategy.md)
- [Solo-founder validation plan](../../research/solo-founder-validation-plan.md)
- [Human-to-agent task guide](../../ai/human-agent-task-guide.md)

## In scope

- audit the release candidate and Phase 7 evidence against the checklist below;
- identify evidence gaps, blockers, accepted risks, owners, and due conditions;
- define the smallest safe cohort, capacity, feature exposure, and operating window;
- define objective rollout success, pause, stop, and rollback conditions;
- identify every action that requires user approval or an external account/cost;
- identify facts that must be freshly verified at implementation time;
- produce `docs/engineering/organic-beta-readiness-review.md`;
- update the handoff with the recommendation and exact next task.

## Out of scope

- deploying or changing a production environment;
- purchasing services, domains, messaging, monitoring, or payment products;
- publishing a landing page or opening beta registration;
- inviting, emailing, messaging, interviewing, or otherwise contacting people;
- creating real accounts or importing personal/business data;
- enabling payment collection or selecting a gateway from stale assumptions;
- presenting legal, tax, accounting, privacy, or provider conclusions as verified without appropriate current evidence;
- changing product scope to make the review pass.

## Readiness checklist

### Product and integrity

- Phase 7 exit evidence is complete and reproducible.
- Booking, payment, expense, and reporting invariants pass.
- Subscription entitlements and onboarding behavior match the beta offer.
- No critical or high-severity defect remains open.

### Security and privacy

- tenant isolation and role-denial evidence is current.
- secrets, authentication, OTP, rate limiting, secure links, logs, and audit controls are production-ready.
- the privacy notice matches actual collection, processing, retention, export, and deletion behavior.
- telemetry excludes unnecessary sensitive or identifying data.

### Operations and recovery

- production ownership, monitoring, alerting, backups, restore, incident response, rollback, and provider-outage procedures are executable by the solo founder.
- recovery objectives have recent drill evidence.
- enrollment can be paused without corrupting existing customer operations.

### Accessibility and performance

- supported mobile and desktop workflows meet the approved accessibility baseline.
- public availability and booking paths meet the performance and reliability thresholds.
- representative low-bandwidth and retry conditions have evidence.

### Support and communication

- support channel, response expectations, escalation, incident communication, data correction, and account closure are documented.
- beta limitations and experimental status are communicated plainly.
- operator capacity is compatible with the proposed cohort.

### Cost, provider, and compliance

- current provider availability, terms, region, quotas, and costs are identified for revalidation.
- a monthly operating ceiling and shutdown/scale-down path are explicit.
- unresolved legal, tax, accounting, merchant, or data-residency questions remain visible blockers where applicable.

### Evidence and decision quality

- beta events and metrics have defined purposes, owners, retention, and decision uses.
- organic acquisition is separated from active outreach.
- success criteria do not imply market validation from technical usage alone.
- every external mutation is listed as a separate approval step.

## Required report structure

1. Candidate and evidence inspected
2. Proposed beta boundary and capacity
3. Checklist result with evidence links
4. Blocking issues
5. Accepted risks and assumptions
6. Facts requiring fresh external verification
7. Approval-required actions
8. Rollout, monitoring, pause, stop, and rollback plan
9. Recommendation: go, conditional-go, or no-go
10. Exact next bounded task

## Verification

- every readiness conclusion links to repository or current external evidence;
- assumptions and verified facts use distinct labels;
- the report contains no invented customer or commercial evidence;
- no external system, person, production state, or paid service was changed;
- local documentation links and repository AI verification pass.

## Completion evidence

- link to the readiness review;
- summary of blockers and approval-required actions;
- explicit recommendation;
- exact proposed next task, which must remain unexecuted until separately authorized when it changes external state.

## Agent assignment prompt

> Perform P8-01 exactly as defined in `docs/planning/phase-8/P8-01-organic-beta-readiness-gate.md`. First load repository context and follow the Sports SaaS engineering skill. This is a read-only review and documentation task: do not deploy, purchase, publish, contact anyone, create real accounts, or enable payments. Audit the Phase 7 candidate and evidence, distinguish facts from assumptions, produce the required readiness review, verify documentation, and update the handoff with an honest go, conditional-go, or no-go recommendation.
