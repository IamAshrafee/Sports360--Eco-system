# ADR-004: PostgreSQL-Specific Core and Shared-Schema Tenancy

Status: Accepted
Date: 2026-07-24

## Context

The SaaS expects many small-to-medium businesses and requires exact money,
correct timestamps, transaction integrity, conflict-safe ranges, report
traceability, and strict tenant isolation.

## Decision

Use a supported PostgreSQL release as the system of record.

Tenant-owned tables use:

- a mandatory `business_id`;
- tenant-safe composite unique keys and foreign keys where relationships could
  otherwise cross tenant boundaries;
- application-level permission and venue-scope enforcement;
- PostgreSQL Row-Level Security as defense in depth;
- a runtime database role that neither owns tables nor has `BYPASSRLS`;
- cross-tenant negative tests for every entity and aggregate query.

Use PostgreSQL-specific ranges, exclusion constraints, exact numeric/integer
money, transaction isolation, partial/index capabilities, and later
partitioning when measured.

## Rejected alternatives

- Database-per-tenant at initial scale: operationally expensive and difficult
  for cross-tenant platform administration/migrations.
- Schema-per-tenant: migration and connection complexity without sufficient
  isolation benefit.
- Database portability as a primary goal: sacrifices useful invariants for an
  unlikely migration.
- RLS as the only authorization layer: database roles/policies have bypass and
  context risks.

## Consequences

- SQL and migrations receive first-class review and tests.
- Connection-pool tenant context must be transaction-scoped and reset safely.
- Large tenants may later be placed on separate clusters using the same tenant
  routing abstraction.
- Provider choice must expose required PostgreSQL features and restore support.

## References

- [PostgreSQL ranges](https://www.postgresql.org/docs/current/rangetypes.html)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Traceability

AUTH-001–012; NFR-SEC-001–008; NFR-FIN-001–006; NFR-REC-001–006.
