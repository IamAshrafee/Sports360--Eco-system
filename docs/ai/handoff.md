# Current Handoff

Status: Active

Updated: 2026-07-24

## Outcome

Phase 5 implementation is active and P5-01 Configuration Core is implemented
and verified. An authenticated Owner or venue-scoped Manager can manage
tenant-owned activities, independent resources, and fixed-duration compatible
offerings through `/v1` and the shadcn-based setup UI.

PostgreSQL enforces tenant, venue, permission, lifecycle, and relationship
boundaries. OpenAPI and the generated TypeScript client are current. Schedules,
prices, availability, bookings, customers, payments, Today, reports, and
public booking remain deliberately unimplemented.

The local toolchain entry is also stabilized. `./scripts/pnpmw` now activates
the exact `.node-version` through NVM when agent or non-interactive shells
select Homebrew Node.js 26. `project:doctor` validates version declarations,
dependency links, the generated client build, and optional local
infrastructure before development continues.

The macOS daily-development workflow is now automated and verified. Finder
launchers provide one-click Start, Restart, Status, and Stop actions over a
single guarded supervisor. The supervisor starts infrastructure, runs the full
doctor, waits for web/API/worker readiness, streams separated service logs, and
cleans up application process trees without deleting local database data.

## Files

- `packages/persistence/migrations/005_configuration_core.sql` and
  `006_configuration_invariant_hardening.sql` — schema, composite
  relationships, RLS, grants, and deferred active-offering checks.
- `packages/persistence/src/configuration.ts` and
  `configuration.integration.test.ts` — tenant-scoped repository operations
  and real PostgreSQL proof.
- `packages/contracts/src/configuration.ts` and
  `packages/domain/src/configuration.ts` — runtime contracts and pure
  configuration rules.
- `apps/api/src/configuration-service.ts` and `configuration-routes.ts` —
  authorization orchestration and `/v1` HTTP contract.
- `docs/specification/openapi.json` and
  `packages/api-client/src/generated/` — generated API artefacts.
- `apps/web/src/app/setup/`, `apps/web/src/components/`, and
  `apps/web/src/lib/configuration-api.ts` — setup routes, interactions, and
  generated-client adapter.
- `packages/ui/src/components/` — shared alert, input, label, and native-select
  primitives needed by the workflow.
- `docs/engineering/phase-5-configuration-core.md` — implementation decisions,
  evidence, limitations, and continuation.
- `scripts/pnpmw` and `scripts/project-doctor.mjs` — canonical runtime-aware
  package-manager entry and actionable environment diagnosis.
- `scripts/dev-environment.sh` and the root `*.command` launchers — guarded
  macOS start, restart, status, and stop workflow for the complete local stack.
- `docs/engineering/local-development-guide.md` — Finder workflow, commands,
  URLs, logs, stop semantics, and manual fallback.
- `AGENTS.md`, the repository skill, README, AI operating guides, engineering
  runbooks, and phase commands — routed through the wrapper.
- `.github/workflows/quality.yml` — continuously runs the full project doctor
  after its exact Node/pnpm installation.

## Decisions

- `resources.activity_id` is authoritative; legacy `activity_code` is retained
  as a transition seam until a separately reviewed forward retirement
  migration.
- Activity codes are stable after creation. Display names and state remain
  editable.
- Fixed duration uses a technical integrity bound of `1..1440` minutes.
- Every resource exposed by P5-01 is one independent allocatable unit.
- Active offerings require an active activity and at least one same-tenant,
  same-venue, compatible active resource.
- Configuration creates rely on exact duplicate constraints rather than adding
  idempotency-key retention without a demonstrated need.
- Lists use deterministic UUIDv7 cursor pagination.
- The generated API client exports compiled JavaScript/declarations; the web
  does not recompile generated transport source under its stricter TypeScript
  policy.
- Setup query parameters are a temporary opaque business/venue context seam,
  not hard-coded demo identity.
- Vercel React guidance influenced parallel reads, cancellable loads, minimal
  client serialization, and server route shells around interactive clients.
- Systematic Debugging identified an incomplete generated dependency tree;
  a clean pinned frozen install repaired it without weakening project checks.
- Browser control confirmed the actual setup shell has no horizontal overflow
  and retains 44 px controls at 320 CSS px.
- Node.js remains at `24.18.0` because it is the current LTS line; the
  numerically newer Node.js 26 line is not yet LTS.
- Local and agent commands use `./scripts/pnpmw`. The wrapper keeps an
  already-correct runtime, loads NVM only when needed, never silently installs
  a runtime, and gives an exact recovery instruction when activation is
  impossible.
- CI keeps direct `pnpm` commands because setup actions establish the declared
  Node and pnpm versions before project scripts run.
- One supervisor owns web, API, worker, and the combined log follower. Its PID
  must resolve to this repository and launcher before an external stop can send
  a signal.
- Routine stop/restart leaves PostgreSQL and Valkey running for speed and data
  continuity. Infrastructure shutdown remains the separate explicit
  `./scripts/pnpmw infra:down` action.

## Verification

- Clean pinned `pnpm install --frozen-lockfile --force` — passed, including the
  runtime preinstall and generated-client postinstall build.
- `./scripts/pnpmw ai:verify` — passed under Node `24.18.0` / pnpm `11.17.0`:
  runtime, ESLint, workspace TypeScript, all unit/component/API tests, and
  formatting.
- `./scripts/pnpmw ai:verify:full` — passed with healthy PostgreSQL `18.4` and
  Valkey `9.1`:
  - OpenAPI/client regeneration;
  - repeated migration reported the schema already current;
  - deterministic seed reported current;
  - authentication and queue integration suites;
  - two persistence integration files with 21 passing tests;
  - production builds for web, API, worker, and shared packages.
- Browser smoke check at 320 × 800 CSS px — passed: page and body width stayed
  at 320 px; setup links, inputs, and primary action measured 44 px high.
- Local Markdown links in the changed documentation files — resolved.
- Prettier check for changed documentation and `git diff --check` — passed.
- `./scripts/pnpmw ai:handoff` — produced the expected branch, HEAD,
  working-tree, and unstaged-diff snapshot.
- Wrong-shell recovery — passed: the caller reported Node.js `26.0.0`, while
  `./scripts/pnpmw --version` selected Node.js `24.18.0` and pnpm `11.17.0`.
- Already-correct runtime and missing-NVM failure cases — passed with stable
  behavior and actionable output.
- `./scripts/pnpmw install --frozen-lockfile` — passed from the Node.js 26
  caller environment with the workspace already current.
- `./scripts/pnpmw project:doctor:full` — passed with zero failures/warnings
  and healthy PostgreSQL and Valkey.
- `./scripts/pnpmw ai:verify` — passed from the Node.js 26 caller environment.
- All five launcher scripts passed Bash syntax checks and have executable
  permissions.
- Real `start` and `restart` runs passed: Docker services became healthy, the
  full project doctor reported zero failures/warnings, and web, API, and worker
  all reached readiness.
- Live `status`, duplicate-start refusal, external `stop`, PID cleanup, and
  post-stop HTTP-down checks passed. PostgreSQL and Valkey deliberately
  remained healthy after application shutdown.
- Final `./scripts/pnpmw ai:verify` passed after the launcher and guide changes:
  runtime, ESLint, TypeScript, all unit/component/API tests, and formatting.

## Repository state

- Branch: `main`
- HEAD: `8ea0c20 Phase 5, cycle 01 is done.`
- `main` matches `origin/main`.
- P5-01 and its toolchain stabilization are committed at the current HEAD. The
  working tree contains only the uncommitted macOS development launchers,
  supervisor, package aliases, and related documentation from this task.
- `docs/others/` was preserved.
- No launcher-task files were staged, committed, pushed, or deployed.

## Risks and limitations

- The implementation has no durable Git checkpoint until the user requests a
  commit.
- Authenticated navigation does not yet provide a first-class business/venue
  selector; setup accepts opaque IDs for this bounded slice.
- The web smoke check covers the setup shell at 320 px. Component tests cover
  form keyboard, association, loading/error/success, permission, and stale
  states without a live authenticated browser session.
- Deployment, provider behavior, and measured Dhaka-region production
  performance remain unverified.
- `scripts/pnpmw` is a Bash/NVM entry for the current macOS/Linux development
  and CI model. A future Windows-native development workflow would require an
  equivalent reviewed entry rather than bypassing runtime checks.
- Finder `.command` launchers are macOS-specific. Linux and agent workflows use
  the same `scripts/dev-environment.sh` supervisor directly.
- The live launcher run exposed an existing Base UI development warning where a
  Button renders a non-button target with native-button semantics on the home
  and setup shells. It did not affect launcher readiness, but the UI usage
  should be corrected in the next frontend slice.

## Remaining work

1. Create a Git checkpoint only if the user requests it.
2. Prepare the bounded P5-02 Schedule and Fixed Slots brief.
3. Implement P5-02 without entering pricing, availability, booking, payment,
   or public scope.

## Next action

Start P5-02 by reconciling the schedule/time invariants, workflow
`US-CFG-003` / `AC-CFG-003`, and the detailed P5-02 gate in
`docs/planning/phase-5-delivery-plan.md`. Produce an implementation-ready task
brief before changing schema or code.
