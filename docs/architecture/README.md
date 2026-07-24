# Phase 3: Domain, Data, and Technical Architecture

Status: Complete

## Purpose

Phase 3 turns the accepted product behavior into a system design that protects:

- booking correctness under concurrency;
- tenant and venue isolation;
- exact financial history;
- correct time and operational-day meaning;
- low latency for Bangladeshi users;
- controlled infrastructure cost;
- maintainability by one developer;
- growth without a rewrite.

“Scalable” means these properties remain true as traffic, records, tenants, and
features grow. It does not mean deploying every distributed-system component
before the product has users.

## Phase 3 outputs

1. [Architecture foundations and decision gates](architecture-foundations-and-decision-gates.md)
2. [Architecture Decision Records](adrs/README.md)
3. [API-first and multi-client strategy](api-first-and-client-strategy.md)
4. [Domain model and aggregate boundaries](domain-model-and-aggregates.md)
5. [Domain state machines](domain-state-machines.md)
6. [Booking capacity and concurrency design](booking-capacity-concurrency-design.md)
7. [Logical data model and data dictionary](logical-data-model.md)
8. [Tenancy and authorization architecture](tenancy-and-authorization-architecture.md)
9. [Money, time, audit, idempotency, and outbox](money-time-audit-and-idempotency.md)
10. [Application topology and module contracts](application-topology-and-module-contracts.md)
11. [Background jobs and integration architecture](background-jobs-and-integration-architecture.md)
12. [Deployment, scaling, and recovery](deployment-scaling-and-recovery.md)
13. [Security and abuse threat model](security-threat-model.md)
14. [Architecture test strategy](test-strategy.md)
15. [Technology and provider selection](technology-and-provider-selection.md)
16. [Provider cost, growth, and exit strategy](provider-cost-and-exit-strategy.md)
17. [Phase 3 traceability and gate review](phase-3-traceability-and-gate-review.md)

## Working sequence

```text
Architecture goals and decision gates
→ Domain language and invariants
→ Aggregate/state design
→ Logical data model
→ Tenancy, booking, money, time, and audit proofs
→ Application/API/job topology
→ Provider and deployment selection
→ Threat model and test strategy
→ Architecture validation
```

Provider selection follows the invariant and topology work. A convenient cloud
service must not decide the product’s domain model.

## Architecture rules

- The database is the final authority for capacity and financial integrity.
- Authorization is server-side and scoped by business membership and venue.
- APIs are stateless; correctness never depends on one process’s memory.
- Cache loss must reduce performance, not corrupt business truth.
- Booking, payment, verification, attendance, and subscription states remain
  independent.
- Synchronous transactions are short; slow external work is asynchronous.
- Every retried mutation and background job has an idempotency identity.
- Observability and restore capability are part of the initial architecture.
- Modules communicate through explicit contracts even when deployed together.
- A future service extraction must be possible without making it necessary now.

## Status control

An architecture choice becomes final only when:

1. context and required quality attributes are stated;
2. realistic alternatives are compared;
3. operational cost for one developer is included;
4. consequences and migration seams are documented;
5. the decision is recorded as an ADR; and
6. affected specifications and test requirements remain traceable.

## Completion record

- 12 accepted architecture decisions
- PostgreSQL-enforced capacity, tenancy, money, time, audit, and idempotency
  designs
- Separate web/API/worker modular-monolith topology
- Versioned API strategy for web, future mobile, embeds, and integrations
- Authentication, queue, notifications, observability, repository, and
  provisional cloud selections
- Three cost envelopes plus provider exit runbooks
- Executable Phase 4 proof list and full Phase 3 gate review
