# ADR-006: Lean Managed and Portable Infrastructure

Status: Accepted
Date: 2026-07-24

## Context

There is no confirmed infrastructure budget, no revenue evidence, and one
developer. The system still needs production-grade backup, restore, monitoring,
security, and a growth path.

## Decision

Begin with the lean managed-infrastructure direction:

- portable OCI containers for web, API, and worker;
- managed PostgreSQL with automated backup and point-in-time recovery;
- managed Redis-compatible service only when queue/rate-limit needs require it;
- S3-compatible object storage;
- CDN/reverse proxy and managed TLS;
- OpenTelemetry/OTLP-compatible observability;
- co-located application and data services in the measured lowest-latency
  viable South Asian region.

Provider selection is intentionally deferred until a current pricing, region,
feature, support, and exit-cost comparison is documented.

## Cost-control policy

- Local development uses containers and synthetic fixtures.
- Founder simulation should not require enterprise infrastructure.
- Organic beta activates the smallest paid configuration satisfying backup,
  recovery, security, and performance gates.
- Scale vertically first where safe, then add replicas/read optimization.
- Every recurring provider cost must map to a requirement or measured bottleneck.

## Rejected alternatives

- AWS-first by default without budget or operational need.
- Free-tier-only production that cannot satisfy backup/recovery requirements.
- Provider-specific application primitives that prevent container/database
  portability without material benefit.
- Self-hosting stateful databases for the initial production release.

## Consequences

- Exact provider and monthly cost remain an open Phase 3 decision.
- Deployment code and backups must make provider recovery/migration practical.
- Lean does not mean unreliable; recovery and isolation gates remain mandatory.

## Subsequent decision

[ADR-009](ADR-009-initial-cloud-and-region.md) resolves the provider-selection
work by choosing DigitalOcean Bangalore provisionally, with Render Singapore
as fallback and mandatory pre-production gates. This ADR's lean/portable policy
remains in force.

## Traceability

NFR-REC-001–006; NFR-OBS-001–005; NFR-MNT-002–006; solo-founder operational
constraint.
