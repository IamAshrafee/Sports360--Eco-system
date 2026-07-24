# ADR-005: Database-Enforced Capacity with Serialized Resource Mutations

Status: Accepted
Date: 2026-07-24

## Context

Holds, bookings, reschedules, extensions, reassignments, expiries, and emergency
blocks can race across several API and worker replicas. No in-memory lock or
availability read can guarantee correctness.

## Decision

- Represent active playable-capacity claims with PostgreSQL `tstzrange` using
  half-open `[start,end)` intervals.
- Enforce non-overlap for active claims through a GiST exclusion constraint
  including tenant/resource identity.
- Acquire a database row/advisory guard scoped to the affected resource before
  mutations that must coordinate with resource blocks.
- Recheck schedule, policy, active block, compatibility, and claim state inside
  the committing transaction.
- Convert a hold to a booking without releasing a capacity gap.
- Treat expected conflict, expired hold, serialization, and deadlock outcomes
  as retryable/domain results according to command semantics.
- Never place provider/network calls inside the capacity transaction.

Resource blocks remain separately representable because an urgent safety block
must be allowed to overlap existing bookings and create explicit resolution
work. The resource guard orders block creation against new capacity claims.

## Rejected alternatives

- Check-then-insert without a database constraint.
- Redis/distributed locks as the final authority.
- Materialized slots as the only conflict mechanism.
- One global booking lock.
- Forcing emergency blocks to silently cancel reservations.

## Consequences

- Hot requests serialize per resource, not across the whole venue.
- The schema needs an active-claim lifecycle that does not rely on volatile
  current-time predicates in an index.
- Expiry workers release claims explicitly and idempotently.
- A database integration stress test proves the invariant before feature work.

## Traceability

BKG-002–008; BKG-013–016; OPS-005–006; OPS-016; NFR-001–002;
NFR-REL-001–007.
