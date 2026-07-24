# ADR-011: OpenTelemetry with Better Stack as the Initial Backend

Status: Accepted
Date: 2026-07-24

## Context

One developer needs correlated errors, logs, traces, metrics, uptime checks,
scheduled-job heartbeats, and actionable alerts without operating a full
observability stack or stitching several paid vendors together.

Telemetry may contain tenant and operational context, so data minimization and
cost control matter as much as collection.

## Decision

- Instrument API and worker traces/metrics through OpenTelemetry.
- Emit structured JSON application logs with trace/span/correlation IDs.
- Use Better Stack as the initial hosted backend for logs, traces, metrics,
  errors, external uptime, and job heartbeats.
- Begin with the free personal-project allowances for development and
  founder-operated simulation; approve paid retention/volume only from measured
  beta telemetry.
- Sample successful high-volume traces while retaining errors and important
  booking/payment/job spans according to a documented policy.
- Define a telemetry allowlist and automated redaction tests. Do not send OTPs,
  tokens, full phone numbers, full payment references, message bodies, or raw
  request bodies.
- Keep critical business/security audit records in PostgreSQL; observability is
  not the audit ledger.
- Export through OTLP and stable logging interfaces so the backend can change.

Browser real-user monitoring and session replay are disabled initially. They
require a separate privacy review, explicit masking, and a product need.

## Alternatives

- Grafana Cloud: strong open ecosystem and a viable fallback, but broader
  dashboard/telemetry assembly than the first solo-operated release needs.
- Sentry plus a separate log/uptime service: excellent application-error
  workflows but duplicates ingestion and adds a second console/cost boundary.
- Provider-native monitoring only: simple initially but weakens cross-provider
  correlation and exit portability.
- Self-hosted Grafana/Loki/Tempo/Prometheus: avoids hosted telemetry dependence
  but creates an observability platform to operate.

## Consequences

- Three-day free-tier retention is insufficient for some beta investigations;
  paid retention or controlled archive may be required before external use.
- Telemetry volume limits and sampling must be visible on an operational
  dashboard.
- Provider outage must not block application requests; export is buffered and
  fail-open within bounded resource limits.
- Security incidents and durable audit evidence keep a restricted,
  application-owned record.

## Migration and reversal path

OTLP traces/metrics and structured logs can be redirected to Grafana Cloud,
another OTLP service, or a self-hosted collector. Dashboards/alerts are
documented as code or reproducible configuration where the provider permits it.

## References

- [Better Stack OpenTelemetry ingestion](https://betterstack.com/docs/logs/open-telemetry/)
- [Better Stack distributed tracing](https://betterstack.com/docs/logs/tracing/)
- [Better Stack monitoring](https://betterstack.com/docs/uptime/monitoring-start/)
- [Better Stack pricing](https://betterstack.com/pricing)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)

## Traceability

NFR-OBS-001–005; NFR-PRV-002; NFR-REC-005; NFR-SEC-007–008.
