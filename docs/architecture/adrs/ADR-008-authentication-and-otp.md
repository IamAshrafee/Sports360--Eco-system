# ADR-008: Better Auth with Application-Owned Authorization and Pluggable OTP

Status: Accepted
Date: 2026-07-24

## Context

Bangladesh-first customer access is phone-oriented, while business staff need
secure sessions, recovery, revocation, and future stronger authentication. The
application must also support mobile and public integrations after the MVP.

Authentication mechanics and business authorization are different concerns.
No authentication library should own tenant membership, venue scope, customer
relationships, or platform permissions.

## Decision

- Use self-hosted Better Auth for browser credential/session mechanics.
- Store Better Auth-owned tables in a separate PostgreSQL `auth` schema.
- Link each authenticated subject explicitly to the application `users` table
  using an opaque `auth_subject_id`; do not make domain tables depend directly
  on library table shape.
- Use secure, HTTP-only, same-site cookies for the first-party web session.
- Use the Better Auth phone-number plugin through a custom `OtpPort`.
- The application owns business memberships, fixed role profiles, venue scope,
  authorization decisions, customer identities, account status, security
  audit, and forced-revocation/version semantics.
- Mobile authentication will use a separately threat-modelled token/device
  flow; public integrations use scoped installation/API credentials, not copied
  browser cookies.
- Apply origin checks, trusted-host configuration, proxy/IP correctness,
  enumeration-safe responses, short OTP expiry, purpose binding, send/verify
  attempt limits, and destination/IP/device rate limits.
- Never store plaintext OTPs in application tables, logs, traces, or analytics.

Better Auth's generated schema changes are reviewed and converted into the
normal ordered migration process. The library never auto-migrates production
on API startup.

## Bangladesh SMS provider decision

Use a provider adapter and a staged selection:

1. `sms.bd`/Alpha SMS is the first production-candidate adapter because it
   publishes a local REST API, OTP use, masking, and Bangladesh pricing.
2. BulkSMS.BD is the first fallback candidate.
3. No provider becomes active production OTP transport until an account and
   sender identity are approved and delivery tests pass on Grameenphone,
   Robi/Airtel, Banglalink, and Teletalk.
4. Twilio remains an international/fallback option, not the Bangladesh default,
   because Bangladesh traffic requires registered sender-ID handling and
   operator coverage preparation.

This is a conditional provider selection, not a claim that public website
pricing proves real delivery quality.

## Alternatives

- Fully custom authentication: maximum control but excessive security and
  maintenance responsibility for one developer.
- Managed identity SaaS: simpler operations but higher recurring cost,
  provider-shaped phone behavior, and more migration dependence.
- Authentication-library organization/role plugins: rejected for business
  authorization because the domain model needs tenant-local membership plus
  separate venue scope and customer relationships.

## Consequences

- Better Auth security advisories and upgrades become explicit maintenance
  work.
- Authentication schema and domain identity mapping receive integration and
  recovery tests.
- SMS provider failure can be switched or degraded without rewriting booking
  or identity truth.
- Public checkout must not confirm a flow that required OTP when all configured
  OTP routes fail.

## Migration and reversal path

The `auth_subject_id` seam, application-owned authorization, and `OtpPort`
allow credential/session or delivery providers to change without rewriting
business memberships and domain history. A provider change requires controlled
identity relinking and session invalidation, not tenant-data migration.

## References

- [Better Auth phone-number plugin](https://better-auth.com/docs/plugins/phone-number)
- [Better Auth session management](https://better-auth.com/docs/concepts/session-management)
- [Better Auth PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql)
- [Better Auth security](https://better-auth.com/docs/reference/security)
- [Better Auth rate limiting](https://better-auth.com/docs/concepts/rate-limit)
- [sms.bd API](https://sms.bd/api)
- [BulkSMS.BD](https://bulksms.bd/)
- [Twilio Bangladesh SMS guidelines](https://www.twilio.com/en-us/guidelines/bd/sms)

## Traceability

AUTH-001–012; NFR-SEC-001–008; NFR-PRV-001–006; NFR-MNT-005.
