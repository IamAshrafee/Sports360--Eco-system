# Deployment, Scaling, and Recovery Architecture

Status: Phase 3 selected baseline with pre-production provider gates

## Deployment goals

- Low latency for Bangladesh.
- Small affordable starting footprint.
- Horizontal web/API/worker growth.
- Managed stateful services.
- Repeatable infrastructure and releases.
- Point-in-time database recovery.
- Provider portability without pretending migration is free.

## Environments

| Environment | Purpose | Data rule |
|---|---|---|
| Local | Development and fast integration tests | Synthetic six-archetype fixtures |
| CI ephemeral | Migrations, unit/integration/contract/security tests | Created/destroyed per run |
| Preview | UI/API review for selected changes | Synthetic data; no production secrets |
| Staging | Production-like release, restore, load, provider sandbox | Synthetic/anonymized approved fixtures only |
| Production | Organic beta/commercial service | Real tenant data; strict access/audit/backup |

Staging matches production PostgreSQL major/extensions and deployment topology
as closely as cost permits.

## Initial production components

```text
DNS + CDN/WAF/reverse proxy + managed TLS
Next.js web service (minimum one, horizontally scalable)
Fastify API service (minimum one, horizontally scalable)
Worker service (minimum one; separated concurrency pools if needed)
Managed PostgreSQL primary + PITR/automated backups
Managed Redis-compatible service for queue/rate limit/cache
Private object storage for exports/assets
Secrets/configuration manager
OTLP-compatible metrics/traces + structured log backend
External uptime checks and alert delivery
```

High availability and replica counts increase with beta risk/usage, but backup,
restore, isolation, encryption, and monitoring are not deferred.

## Selected provider and region

The provisional production selection is:

```text
Cloudflare DNS/proxy
→ DigitalOcean App Platform (BLR)
→ DigitalOcean Managed PostgreSQL + Managed Valkey (same region/VPC)
→ DigitalOcean Spaces (BLR)
```

Render Singapore is the documented fallback. ADR-009 controls the provider
activation gates and the provider cost/exit strategy controls cost envelopes
and migration.

## Region verification

Before provider choice:

1. shortlist viable managed-service regions near Bangladesh, normally South
   Asia/Southeast Asia;
2. measure Dhaka fixed and mobile network latency to complete app/API/database
   paths—not just provider ping;
3. confirm all required PostgreSQL extensions, PITR, Redis, object storage,
   observability, support, and pricing in that region;
4. co-locate API, worker, PostgreSQL, and Redis;
5. use CDN edge for static/published content;
6. document data-location/legal implications separately.

Do not split API and primary database across distant regions for perceived
frontend speed. Booking commit latency and failure risk are dominated by
database round trips.

## Network and trust boundaries

- Public ingress reaches CDN/reverse proxy and public web/API only.
- Database/Redis are private-network or strict allow-list endpoints.
- Worker has no public inbound endpoint unless a provider webhook terminates at
  the API.
- Provider webhooks enter a dedicated limited route with signature, size, time,
  and rate controls.
- Management access uses least privilege, MFA, audited control plane, and no
  shared root credentials.
- Egress to providers is explicit/observable; secrets remain in managed config.

## Stateless process scaling

Web/API replicas do not store:

- user sessions only in process memory;
- booking locks;
- idempotency truth;
- queue/job truth;
- generated export files on local disk;
- tenant configuration required after restart.

Graceful deployment:

1. new replica starts and passes startup/readiness checks;
2. old replica becomes unready;
3. ingress stops new work;
4. in-flight requests/jobs drain within bounded timeout;
5. expired leases/retries recover interrupted work;
6. old replica terminates.

## Database connection budget

Define:

```text
database connection limit
- reserved administration/migration/recovery connections
= application budget
```

Then allocate explicit maximum pools across:

```text
(API replicas × API pool)
+ (worker replicas × worker pool)
+ web direct pool (expected zero)
+ staging/ops allowance
≤ application budget
```

Autoscaling is capped by this calculation. A managed pooler may multiplex
connections, but transaction-local RLS context, prepared statements, and driver
behavior must be proven under its pooling mode.

## Scaling stages

### Stage E0

- one managed primary sized from measured fixture;
- small web/API/worker services;
- Redis for queue/rate limits, not required for truth;
- correct indexes, query plans, bounded pools;
- CDN for static/published content.

### Stage E1

Based on measured signals:

- increase primary CPU/memory/IO before unnecessary topology;
- add API/web/worker replicas;
- add read replica only for replica-safe reporting/public reads;
- introduce/rebuild read projections;
- partition high-volume append-only history;
- tenant-aware fairness/rate limits;
- separate worker pools for provider/export/projection workloads.

### Stage E2

Only after sustained need:

- tenant routing layer and dedicated cluster for extreme/enterprise tenants;
- regional read/public delivery strategy;
- extract independently loaded/failing modules;
- dedicated analytics store for non-transactional heavy analysis;
- multi-region recovery or service as required by business evidence.

## Release and migration strategy

- Immutable build artifact promoted through environments.
- Infrastructure/configuration is version-controlled.
- Migrations run as a distinct job/role, not opportunistically from every API
  replica.
- Pre-deploy backup/check is required for risky migrations.
- Expand → backfill/checkpoint → switch reads/writes → contract.
- Old and new application versions can overlap during rolling deployment.
- Large backfills are bounded/resumable and do not hold long table locks.
- PostgreSQL lock/statement timeouts prevent migration from freezing operations.
- Rollback is code rollback only when schema remains backward compatible;
  otherwise use tested forward fix/recovery plan.

## Backup and recovery

Working targets from Phase 2:

```text
RPO ≤ 15 minutes
RTO ≤ 4 hours before organic beta
```

Requirements:

- automated encrypted backups/PITR;
- backup retention documented;
- object-storage/export retention separately defined;
- credentials/keys backed up or recoverable securely;
- restore occurs into isolated infrastructure;
- restored application checks tenant relations, capacity claims, booking states,
  transaction links, audit/outbox, and known report totals;
- DNS/service cutover procedure documented;
- destructive incident preserves evidence where safe.

Restore success means application integrity passes, not merely that PostgreSQL
starts.

## Disaster scenarios

| Scenario | Recovery |
|---|---|
| API/web process failure | Replace replica; clients retry idempotent mutations |
| Worker failure | Lease expiry/retry; outbox/due-time source recovers work |
| Redis loss | Recreate service; replay outbox/sweeps; cache warms; no truth loss |
| Object-storage artifact loss | Regenerate rebuildable exports; restore required assets according to policy |
| Bad deployment | Drain/rollback compatible artifact or forward fix |
| Bad migration/data corruption | Stop writes if needed, restore/PITR, reconcile and controlled cutover |
| Region outage | Initial documented restore/redeploy into supported alternate region; later warm strategy if evidence requires |
| Provider outage | Circuit/open degraded path; domain commits remain correct |
| Credential compromise | Rotate/revoke, increment session/access versions, audit and incident process |

## Cost governance without a known budget

Provider selection produces three monthly estimates:

1. **Development/founder simulation**
2. **Organic beta minimum satisfying RPO/RTO/security**
3. **Growth configuration at specified measured load**

For each recurring cost:

```text
service
requirement it satisfies
minimum size
usage-based risk
upgrade trigger
exit/migration path
```

Free tiers may support development but are not assumed to meet production
recovery, uptime, or support requirements. Enterprise services are not bought
for hypothetical scale.

## Provider-selection scorecard

| Category | Weight direction |
|---|---|
| Bangladesh end-to-end latency | Very high |
| PostgreSQL feature/extensions/PITR/restore | Very high |
| Operational simplicity for one developer | Very high |
| Predictable baseline and usage cost | Very high |
| Private networking/security/secrets | High |
| Container/API/worker support and graceful deploy | High |
| Redis/object storage availability | High |
| Observability/OTLP integration | Medium-high |
| Portability/export and provider exit | Medium-high |
| Support/documentation/status history | Medium |

The comparison is complete. DigitalOcean Bangalore is selected conditionally;
the scorecard remains the pass/fail instrument before production activation.
Provider marketing or geographic distance never overrides measured
end-to-end results.

## Operational readiness gate

Before organic beta:

- production-like load and 50-way hot-slot tests pass;
- backup restore meets RPO/RTO and reconciles fixture totals;
- alert drills detect API, database, worker, backup, and queue failure;
- secrets rotate without code change;
- release rollback/forward-fix rehearsal passes;
- tenant isolation and external surface tests pass;
- on-call response is realistically manageable by one developer;
- monthly cost and upgrade triggers are documented.
