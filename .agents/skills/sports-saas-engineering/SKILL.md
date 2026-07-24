---
name: sports-saas-engineering
description: Apply the repository's approved product, architecture, security, phase, API, database, UI, testing, and handoff rules when planning, implementing, debugging, reviewing, or documenting the Sports Venue Management SaaS. Use for any material task in this repository, especially Phase 5 booking work, tenant-scoped PostgreSQL changes, API contracts, Next.js or shadcn UI, jobs, payments, and completion verification.
---

# Sports SaaS Engineering

Use the repository's durable context instead of relying on chat history. Keep
implementation aligned with the current phase and protect the system's
high-risk tenant, booking, money, time, API, audit, and job invariants.

## Orient

1. Locate the repository root containing `AGENTS.md`.
2. Read `AGENTS.md` completely.
3. Run `./scripts/pnpmw ai:context`.
4. Read `docs/ai/current-state.md` and `docs/ai/context-map.md`.
5. Inspect Git state and preserve unrelated or user-owned changes.

Do not infer completed behavior from planning documents. Treat code and fresh
tests as implementation evidence and approved documents as intended behavior.

## Route the task

Use `docs/ai/context-map.md` to load the minimum relevant product,
specification, architecture, ADR, engineering, and implementation sources.
Classify the request as one of:

- current-phase delivery;
- a necessary correction or prerequisite;
- research or design;
- future compatibility only;
- deferred scope requiring explicit approval.

Future briefs preserve direction but do not authorize implementation. For
Phase 5, trace each slice from approved outcome through workflow, story,
acceptance criterion, invariant, API, persistence, UI, and automated evidence.

## Protect the architecture

Before editing, identify which boundaries apply:

- tenant `business_id`, composite foreign keys, RLS, membership, permission, and
  venue scope;
- PostgreSQL capacity/concurrency enforcement and transaction semantics;
- integer minor-unit money, timezone, and operational-date rules;
- audit, idempotency, outbox, retry, and sensitive-data redaction;
- versioned HTTP contracts and generated clients;
- shadcn/Base UI ownership in `packages/ui`, semantic tokens, and accessibility;
- provider-independent domain and API contracts.

Never weaken one of these boundaries to simplify implementation or make a test
pass. Follow the modular-monolith package responsibilities recorded in
`docs/engineering/phase-4-foundation.md`.

## Implement and verify

1. Prefer the smallest complete vertical slice.
2. Keep runtime validation, OpenAPI, and generated clients synchronized.
3. Use real PostgreSQL tests for RLS, constraints, migrations, locking, and
   concurrency.
4. Add focused authorization, error, time, money, job, and accessibility cases
   when affected.
5. Run narrow checks while iterating.
6. Read `docs/ai/definition-of-done.md`.
7. Run `./scripts/pnpmw ai:verify`; use `./scripts/pnpmw ai:verify:full` when
   the documented full-gate triggers apply.

Report commands as passed only when they completed successfully in the current
work. Distinguish implemented, verified, deferred, mocked, and unverified.

## Reconcile and hand off

Update affected source-of-truth documents when a decision, contract, phase,
workflow, operational rule, or risk changes. Run `./scripts/pnpmw ai:handoff`
and update `docs/ai/handoff.md` after material work.

Do not duplicate whole specifications in the handoff. Reference paths and
record outcome, verification, decisions, risks, remaining work, repository
state, and the exact next action. Redact secrets and personal data.

## Combine with public skills

Use approved public skills only for generic technique. This skill and
`AGENTS.md` override a public skill when it:

- broadens the MVP;
- conflicts with an accepted ADR;
- uses unpinned `@latest` tooling;
- bypasses the API or database safety model;
- introduces an unapproved provider/framework;
- duplicates project tooling without a clear benefit;
- claims completion without repository evidence.

Read `docs/ai/public-skills-policy.md` before proposing or installing another
skill.
