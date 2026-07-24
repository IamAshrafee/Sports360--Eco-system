# Current Handoff

Status: Active

Updated: 2026-07-24

## Outcome

Phase 5 implementation is active. P5-01 Configuration Core and P5-02 Schedule
and Fixed Slots are implemented and verified.

An authenticated Owner or authorized venue-scoped Manager can define
immutable, effective-dated venue or resource operating schedules, add
closed/replacement operational-date exceptions, and preview fixed internal
slots for a compatible offering and resource. The preview resolves the
effective resource override or venue fallback, retains IANA timezone and
operational-date context, and exposes exact and local boundaries.

This remains configuration, not availability. Pricing, policies, live
availability, capacity claims, resource blocks, customers, bookings, payments,
Today, reports, and public booking are deliberately unimplemented.

## Implemented files

- `packages/persistence/migrations/007_schedule_and_fixed_slots.sql` —
  schedule relations, effective-range exclusion, composite relationships,
  immutable content, grants, forced RLS, and audit support.
- `packages/domain/src/schedule.ts` and `schedule.test.ts` — schedule
  validation, exception precedence, timezone conversion, and fixed-slot
  generation.
- `packages/persistence/src/schedule.ts` and
  `schedule.integration.test.ts` — tenant-scoped create/list/preview,
  deterministic effective-version resolution, audit, and real PostgreSQL
  proof.
- `packages/contracts/src/schedule.ts` — shared create/list/preview runtime and
  TypeScript contracts.
- `apps/api/src/configuration-service.ts` and `configuration-routes.ts` —
  authorization orchestration and three schedule endpoints.
- `docs/specification/openapi.json` and
  `packages/api-client/src/generated/` — regenerated API contract and compiled
  client.
- `apps/web/src/app/setup/schedule/`,
  `apps/web/src/components/schedule-setup.tsx`, and
  `apps/web/src/lib/configuration-api.ts` — server route shell, interactive
  setup workflow, and generated-client adapter.
- `apps/web/src/components/schedule-setup.test.tsx` — loading, creation,
  replacement exception, preview, error recovery, and accessibility coverage.
- `docs/planning/phase-5/P5-02-schedule-and-fixed-slots.md` — reconciled task
  brief and scope boundary.
- `docs/engineering/phase-5-schedule-and-fixed-slots.md` — implementation and
  verification evidence.

## Decisions

- Schedule versions are immutable. A correction creates another effective
  version instead of changing historical content.
- A resource schedule fully overrides the venue schedule when effective;
  otherwise the venue schedule is the fallback.
- Exceptions replace recurring periods for one operational date. `CLOSED`
  means no periods; `REPLACE` supplies the complete replacement set.
- Cross-midnight periods belong to their opening operational date.
- Fixed slots partition effective periods using the offering's exact duration;
  a short trailing remainder is not exposed.
- Effective dates are returned from PostgreSQL as date text to prevent host
  timezone conversion from shifting the calendar day.
- Nonexistent DST boundaries are rejected. Repeated openings use the earlier
  instant and repeated closings use the later instant.
- Schedule preview is never labelled or treated as availability.
- No new timezone/calendar dependency, idempotency retention, outbox event,
  provider integration, or competing UI library was introduced.
- Affected polymorphic Button-as-Link usage was replaced with semantic Next.js
  links styled by the shared button variants, removing the Base UI warning.
- Vercel React guidance influenced parallel initial reads, minimal route
  serialization, server shells, and transition-backed client mutations.

## Verification

- `./scripts/pnpmw ai:verify` — passed:
  - Node `24.18.0` and pnpm `11.17.0` runtime verification;
  - ESLint with zero warnings;
  - all workspace TypeScript checks;
  - all unit, component, and API tests;
  - repository formatting.
- `./scripts/pnpmw ai:verify:full` — passed with healthy PostgreSQL and Valkey:
  - OpenAPI/client regeneration and compiled-client build;
  - repeated migration and deterministic seed;
  - authentication, jobs, and persistence integration suites;
  - production builds for the web, API, worker, and shared packages.
- P5-02 focused evidence:
  - 17 domain tests passed;
  - 11 API/service tests passed;
  - 11 web component/page tests passed;
  - 30 PostgreSQL integration tests passed across security, configuration, and
    schedule suites.
- Live browser smoke at 1440 × 900 and 320 × 800 CSS px passed:
  - no horizontal overflow;
  - setup navigation and schedule boundary notice remained visible;
  - primary controls measured 44 px;
  - no browser console warnings or errors.
- The live browser used the real unauthenticated recovery state because local
  OTP delivery is disabled. Authenticated success is covered by component,
  API, and PostgreSQL tests, not claimed as live-browser evidence.

## Repository state

- Branch: `main`
- HEAD before P5-02: `86df1fb Project start scripts created`
- `main` matched `origin/main` at task start.
- P5-02 contains 37 modified or new paths at this handoff checkpoint.
- The pre-existing generated `apps/web/next-env.d.ts` working-tree difference
  was preserved during implementation and returned to the committed generated
  form after fresh Next.js type generation.
- `docs/others/` was preserved.
- Nothing was staged, committed, pushed, deployed, or sent externally.

Git facts are time-sensitive. Run `./scripts/pnpmw ai:context` before using this
handoff for a later task.

## Risks and limitations

- P5-02 has no durable Git checkpoint until the user explicitly requests a
  commit.
- Authenticated navigation still lacks a first-class business/venue selector;
  setup uses an opaque query-context seam.
- Slot preview proves schedule boundaries only. P5-03 must resolve price and
  policy; P5-04 must resolve live availability and blocks.
- The platform `Intl` implementation supplies timezone data. Production
  runtime/version consistency must remain pinned and monitored.
- Deployment, real provider behavior, and measured Dhaka-region production
  performance remain unverified.

## Remaining work

1. Create a Git checkpoint only if the user requests it.
2. Prepare the bounded P5-03 Price, Policy, and Add-ons task brief.
3. Implement P5-03 without entering live availability, capacity claims,
   booking, payment, or public scope.

## Next action

Start P5-03 by reconciling `US-CFG-004`–`US-CFG-007`,
`AC-CFG-004`–`AC-CFG-007`, `AC-CFG-012`, money invariants, price-rule
precedence, and effective policy history. Produce an implementation-ready brief
before changing schema or code.
