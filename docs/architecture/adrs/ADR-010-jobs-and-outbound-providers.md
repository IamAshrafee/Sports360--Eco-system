# ADR-010: BullMQ, Managed Valkey, and Replaceable Outbound Providers

Status: Accepted
Date: 2026-07-24

## Context

Holds, expiry, reminders, notification attempts, webhooks, exports, and
projections need delayed execution, retries, horizontal workers, and observable
failure. Queue loss must not lose the database event or due-time truth.

SMS delivery quality is locally variable and email is helpful but not required
to commit a booking.

## Decision

- Use BullMQ for the initial durable worker queue over managed Valkey.
- Treat delivery as at-least-once despite BullMQ's normal exactly-once goal.
- Use transactional outbox rows and indexed due-time tables as recoverable
  database truth.
- Use deterministic job IDs/deduplication plus idempotent handlers; queue
  deduplication is an optimization, not the sole correctness guard.
- Use exponential backoff with jitter, bounded attempts/age, failed-job
  retention, operational retry, and dead-letter/quarantine handling.
- Use BullMQ Job Schedulers rather than deprecated repeatable-job APIs where a
  queue schedule is appropriate.
- Keep OTP, transactional notification, email, webhook, and object storage
  behind the ports defined in the background-job architecture.

Outbound provider posture:

- SMS/OTP: `sms.bd` first candidate and BulkSMS.BD fallback, subject to ADR-008
  delivery gates.
- Email: Resend first candidate, initially using its free tier and nearest
  appropriate sending region; email contains no unnecessary sensitive data.
- Booking notification MVP: in-app state and shareable secure links are the
  dependable baseline; SMS/email are feature-flagged delivery enhancements.

## Alternatives

- PostgreSQL-only queue: fewer services, but weaker operational tooling for
  delayed/retried provider work and greater contention with the transactional
  core as load grows.
- Managed proprietary task queue: lower code in some areas but greater provider
  coupling and a harder local/fallback environment.
- Kafka/event streaming: unjustified cost and operational complexity for the
  initial work profile.
- Notification aggregation SaaS: useful later if channel/template complexity
  becomes material; unnecessary before delivery channels are validated.

## Consequences

- Managed Valkey is a real recurring cost, even though it owns no business
  truth.
- BullMQ/Valkey compatibility and crash-window behavior require a Phase 4
  integration spike.
- Queue payloads contain opaque references and safe routing metadata, not
  message bodies, OTPs, or contact records.
- A Valkey outage creates backlog/degradation; outbox relay and due-time
  sweepers recover after service restoration.

## Migration and reversal path

Application modules publish durable outbox intentions, not BullMQ calls.
Replacing BullMQ changes relay/worker infrastructure adapters. Provider ports
allow SMS, email, storage, and webhook implementations to change independently.

## References

- [BullMQ architecture](https://docs.bullmq.io/guide/architecture)
- [BullMQ idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs)
- [BullMQ retries](https://docs.bullmq.io/guide/retrying-failing-jobs)
- [BullMQ job IDs](https://docs.bullmq.io/guide/jobs/job-ids)
- [DigitalOcean Managed Valkey](https://docs.digitalocean.com/products/databases/redis/)
- [Resend pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing)
- [Resend sending regions](https://resend.com/docs/dashboard/domains/regions)

## Traceability

NTF-IAM-001–003; NTF-BKG-001–016; NTF-PAY-001–008; NFR-REC-001–006;
NFR-OBS-001–005; NFR-MNT-005.
