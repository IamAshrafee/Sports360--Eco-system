# ADR-003: TypeScript, Node.js LTS, Next.js, and Fastify

Status: Accepted
Date: 2026-07-24

## Context

The founder is a full-stack JavaScript developer. The system needs strong
runtime validation, fast web delivery, a high-throughput API, shared domain
types, worker support, and an actively maintained ecosystem.

## Decision

- Use strict TypeScript throughout application and shared packages.
- Run production server processes on the current compatible Node.js LTS line.
- Use Next.js App Router and React for web delivery.
- Use Fastify for the dedicated HTTP API.
- Use runtime request/response schemas; TypeScript types alone are not a trust
  boundary.
- Pin exact dependency/runtime versions in Phase 4 and update through tested
  upgrade work.

As of the decision date, Node.js 24 is the latest LTS line and Node.js 26 is
Current. Production does not adopt Current solely for novelty.

## Rejected alternatives

- JavaScript without strict static types.
- Node Current as the default production runtime.
- A Next.js-only backend.
- Selecting a framework only from synthetic hello-world benchmarks.

## Consequences

- Domain packages cannot import browser or framework concerns.
- API serialization and validation are benchmarked with real fixtures.
- Framework upgrades require contract, concurrency, and browser regression
  tests.
- Alternative runtimes may be evaluated later but cannot own correctness before
  compatibility is proven.

## References

- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [Next.js App Router](https://nextjs.org/docs/app/getting-started)
- [Fastify documentation](https://fastify.dev/docs/latest/)

## Traceability

NFR-PERF-001–007; NFR-MNT-001–006; NFR-UX-001–006.
