# ADR-001: Modular Monolith with Separate Process Types

Status: Accepted
Date: 2026-07-24

## Context

The product has a strongly transactional booking core, many related domain
concepts, and one developer. It must scale horizontally without imposing
distributed transactions, service operations, and multi-repository coordination
before domain boundaries stabilize.

## Decision

Use one versioned TypeScript modular monolith in a monorepo, deployed as:

- a Next.js web process;
- a stateless Fastify API process; and
- one or more background worker processes.

Modules own their use cases and persistence access. Cross-module calls are
explicit in-process contracts. Durable asynchronous communication uses an
outbox and idempotent handlers.

## Rejected alternatives

- **Next.js-only full stack:** simpler initially, but weakens the durable API
  boundary and worker/domain separation.
- **Microservices:** unjustified operational and consistency cost for one
  developer and an evolving domain.
- **Single combined process:** prevents independent API/worker scaling and makes
  failure isolation less clear.

## Consequences

- Web, API, and worker scale independently.
- One deployment version keeps domain changes coordinated.
- Module-boundary tests and import rules are required.
- A module may become a service later only for measured scale, failure
  isolation, release cadence, or organizational reasons.

## Traceability

NFR-MNT-001–005; NFR-REL-001–007; Phase 3 scalability objective.
