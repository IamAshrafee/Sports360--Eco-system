# ADR-009: Provisional DigitalOcean Bangalore Production Platform

Status: Accepted with pre-production gates
Date: 2026-07-24

## Context

The first market is Bangladesh, the budget is unknown, and one developer must
operate the system. The platform needs separate web, API, and worker processes,
managed PostgreSQL recovery, managed Redis-compatible queues, private
connections, object storage, version-controlled configuration, and a practical
exit.

Provider names and prices change. Region latency and restore claims must be
tested on the real application path.

## Decision

Use the following provisional production platform:

- DigitalOcean App Platform in Bangalore (`BLR`) for OCI-compatible web, API,
  and worker components;
- DigitalOcean Managed PostgreSQL in the same region/VPC;
- DigitalOcean Managed Valkey in the same region/VPC;
- DigitalOcean Spaces in Bangalore for private assets and rebuildable exports;
- Cloudflare authoritative DNS and proxied ingress, initially on the smallest
  plan satisfying tested security rules;
- DigitalOcean app specification plus container definitions stored in the
  repository.

Use Render Singapore as the documented platform fallback if DigitalOcean fails
the latency, feature, restore, account availability, or operational gates.

The selection becomes production-active only after:

1. Dhaka fixed-network and mobile-network end-to-end measurements beat or
   materially match Render Singapore;
2. PostgreSQL supports every required extension and DDL operation;
3. a seven-day point-in-time restore drill meets `RPO ≤ 15 minutes` and
   `RTO ≤ 4 hours`;
4. private App Platform connections work with transaction-scoped RLS and the
   selected pool behavior;
5. BullMQ compatibility and recovery are proven on managed Valkey;
6. the actual account quote and payment availability fit the approved budget;
7. a same-version `pg_dump` restore to local/fallback PostgreSQL succeeds.

If a gate fails, the fallback is activated through a new or superseding ADR;
correctness requirements are not relaxed to preserve the provider choice.

## Starting cost envelope

Using public list prices on the decision date, an illustrative smallest
production-like single-node setup is approximately:

| Component | Illustrative size | Monthly list price |
|---|---|---:|
| Web | 1 shared vCPU / 1 GiB fixed | USD 10 |
| API | 1 shared vCPU / 1 GiB scalable | USD 12 |
| Worker | 1 shared vCPU / 512 MiB | USD 5 |
| PostgreSQL | Single node / 1 GiB | USD 15 |
| Valkey | Single node / 1 GiB | USD 15 |
| Spaces | Base subscription | USD 5 |
| Fixed subtotal | Before SMS/email/domain/tax/overage | **USD 62** |

This is a planning envelope, not a purchase authorization or uptime promise.
The database and Valkey nodes are not highly available at this price. A
two-container app topology and database/Valkey standby nodes materially
increase the beta configuration cost.

## Alternatives

### Render Singapore

Strong fallback with simple web/worker/Redis-compatible services and managed
PostgreSQL PITR. Singapore is farther from Bangladesh than Bangalore in
geography; only measured application latency decides whether that matters.

### Neon plus a separate application host

Excellent PostgreSQL development/branching and restore capabilities, but the
initial production system would cross provider/network boundaries or pay for
private networking. That is avoidable operational complexity for the core
transaction path.

### AWS-first

Deep regional/service capabilities and a long growth path, but more IAM,
network, deployment, monitoring, and cost-management work than the initial
evidence justifies.

### Self-hosted VPS

Lower headline compute cost, but shifts database patching, backup verification,
failover, queue operation, and host security onto one developer.

## Consequences

- This optimizes early operational simplicity and Bangladesh latency, not
  guaranteed zero downtime.
- Production activation still requires a restore drill and explicit acceptance
  of the chosen availability tier.
- App Platform's ephemeral filesystem makes object storage mandatory for
  durable artifacts.
- The Cloudflare free ruleset is defense in depth, not a replacement for API
  authorization, validation, and application rate limiting.

## Migration and reversal path

- Applications ship as OCI-compatible containers.
- PostgreSQL exits through standard dump/restore or logical migration.
- Valkey owns no unrecoverable domain truth.
- Spaces uses the S3 API and is copied with ordinary object tools.
- DNS remains outside the application host for controlled cutover.
- Provider-specific configuration is isolated in deployment files, not domain
  packages.

## References

- [DigitalOcean App Platform availability](https://docs.digitalocean.com/products/app-platform/details/availability/)
- [DigitalOcean App Platform pricing](https://docs.digitalocean.com/products/app-platform/details/pricing/)
- [DigitalOcean PostgreSQL restore](https://docs.digitalocean.com/products/databases/postgresql/how-to/restore-from-backups/)
- [DigitalOcean PostgreSQL pricing](https://docs.digitalocean.com/products/databases/postgresql/details/pricing/)
- [DigitalOcean Valkey](https://docs.digitalocean.com/products/databases/redis/)
- [DigitalOcean Valkey pricing](https://docs.digitalocean.com/products/databases/valkey/details/pricing/)
- [DigitalOcean Spaces pricing](https://docs.digitalocean.com/products/spaces/details/pricing/)
- [Cloudflare WAF availability](https://developers.cloudflare.com/waf/)
- [Render regions](https://render.com/docs/regions)
- [Render PostgreSQL backups](https://render.com/docs/postgresql-backups)

## Traceability

ADR-006; NFR-PERF-001–007; NFR-REC-001–006; NFR-OBS-001–005;
NFR-MNT-002–006.
