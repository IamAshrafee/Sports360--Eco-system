# Provider Cost, Growth, and Exit Strategy

Status: Phase 3 planning envelope

All prices are public list-price observations on 24 July 2026. Taxes, currency
conversion, domain registration, SMS VAT/recharge rules, overages, and future
provider changes are excluded. Recheck prices before purchase.

## Configuration envelopes

### C0: Local development and founder simulation

| Service | Approach | Estimated recurring provider cost |
|---|---|---:|
| Web/API/worker/PostgreSQL/Valkey | Local containers | USD 0 |
| Telemetry | Better Stack free personal-project allowance | USD 0 |
| Email | Resend free allowance | USD 0 |
| SMS | Fake adapter/provider sandbox | Usage only if deliberately tested |
| Preview | Ephemeral or smallest temporary service | Created only when useful |

Production claims cannot be made from C0.

### C1: Smallest production-like online environment

| Service | Requirement served | Illustrative choice | Monthly |
|---|---|---|---:|
| Web | First-party web | App Platform 1 GiB fixed | USD 10 |
| API | Domain/API execution | App Platform 1 GiB scalable | USD 12 |
| Worker | Async delivery/recovery | App Platform 512 MiB | USD 5 |
| PostgreSQL | System of record + PITR | Managed single node 1 GiB | USD 15 |
| Valkey | Queue/rate limiting | Managed single node 1 GiB | USD 15 |
| Object storage | Exports/assets | Spaces base | USD 5 |
| Observability | Logs/traces/metrics/uptime | Better Stack free initially | USD 0 |
| Email | Optional transaction email | Resend free initially | USD 0 |
| **Fixed subtotal** | Before usage/tax/domain | | **USD 62** |

C1 is useful for staging, closed founder operation, and early low-risk access.
It is not highly available: one app container per process and single-node data
services remain failure points even where managed recovery exists.

### C2: Organic-beta resilience

C2 is sized only after C1 measurements and actual provider quotes. It normally
adds:

- at least two public API/web containers where the platform needs two for app
  high availability;
- PostgreSQL primary plus standby;
- Valkey primary plus standby if queue outage impact justifies it;
- paid telemetry retention if three days is insufficient;
- tested external alert delivery;
- budgeted SMS usage and route fallback;
- backup/export retention outside the provider account where required.

Using currently published minimum database HA pricing alone, PostgreSQL and
Valkey can each begin around USD 60/month for a primary plus one matching
standby at the cited 2 GiB tier. Application replicas and telemetry are added
to that. The exact C2 total is deliberately not fabricated before the account
and load tests.

### C3: Measured growth

Upgrade one bottleneck at a time:

| Signal | First response | Later response |
|---|---|---|
| API CPU/latency | Profile queries/code; vertical size | Add capped replicas |
| Database CPU/IO | Query/index/pool tuning; vertical size | Replica-safe reads, partition measured history |
| Connection pressure | Reduce/cap pools; pooler proof | Larger connection budget |
| Queue oldest age | Fix provider/job; worker concurrency | Separate worker pools/replicas |
| One noisy tenant | Tenant-aware limits/fairness | Dedicated placement only at extreme scale |
| Report cost | Better source queries/indexes | Rebuildable read projections/analytics store |
| Storage/export growth | Retention/lifecycle rules | Separate archive tier/provider |

## Cost-control rules

- Every paid component maps to a release requirement or measured bottleneck.
- Rate limits, sampling, storage lifecycle, and budget alerts prevent
  usage-based surprises.
- Production does not rely on a free tier that can suspend, sleep, or omit the
  required recovery property.
- A provider promotion records list price, expected usage, VAT/tax, foreign
  exchange/payment fee, upgrade trigger, and cancellation/export steps.
- Monthly infrastructure cost is reviewed before every rollout phase.

## Exit runbooks

### PostgreSQL

1. Maintain ordered provider-neutral PostgreSQL migrations.
2. Produce periodic encrypted logical dumps in addition to managed PITR where
   policy requires.
3. Restore a dump into same-major local/fallback PostgreSQL and run integrity
   reconciliation.
4. For live migration, use logical replication/provider migration where
   compatible, then controlled write freeze and delta/cutover.
5. Rotate all database credentials and retain the old cluster only for the
   approved rollback/evidence window.

### App host

1. Build the same pinned OCI images.
2. Recreate environment configuration and health checks from version control.
3. Deploy against a restored/staged database.
4. run smoke, contract, isolation, concurrency, and telemetry tests;
5. lower DNS TTL in advance, cut over through Cloudflare, then monitor.

### Valkey/BullMQ

Valkey is disposable infrastructure, not source-of-truth storage:

1. stop or drain publishers/workers;
2. create the replacement and deploy adapters;
3. republish unprocessed outbox rows and rescan indexed due-time work;
4. reconcile logical job results and notification attempts;
5. remove the old service after the recovery window.

### Object storage

1. inventory objects and classifications;
2. copy with checksum and server-side encryption to an S3-compatible target;
3. verify counts/checksums and signed-link behavior;
4. switch adapter configuration;
5. revoke old credentials and apply approved retention/deletion.

### SMS/email/observability

- Switch adapters/configuration; never rewrite domain history.
- Preserve safe delivery attempt records and provider references.
- Repoint OTLP/log export and recreate the minimum alerts/dashboards.
- Export only data allowed by retention/privacy policy.

## Provider-loss drill

Before organic beta, rehearse:

```text
new application environment
+ restored PostgreSQL
+ fresh empty Valkey
+ copied or rebuildable object artifacts
+ alternate outbound adapters
→ reconciled business operation within RTO
```

This proves the exit path better than a document claiming “no lock-in.”
