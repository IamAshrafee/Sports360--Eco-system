# Sports Venue SaaS Agent Guide

This repository contains a Bangladesh-first, international-ready sports venue
business management SaaS. Phase 4 is complete; Phase 5 is the next planned
delivery phase. Read [docs/ai/current-state.md](docs/ai/current-state.md)
before assuming that a planned capability exists.

## Instruction and evidence order

When sources disagree, use this order:

1. the user's current request;
2. this file and the relevant repository-local skill;
3. approved product decisions and ADRs;
4. specifications and acceptance criteria;
5. implementation and fresh test evidence;
6. planning notes, assumptions, and future briefs.

Code and tests prove current behavior. Documents define intended behavior.
Reconcile meaningful disagreements instead of silently choosing one.

## Start every task

1. Inspect `git status` and preserve unrelated or user-owned changes.
2. Run `corepack pnpm ai:context`.
3. Read only the sources routed by
   [docs/ai/context-map.md](docs/ai/context-map.md).
4. State whether the task belongs to the current phase, a prerequisite, or a
   deferred horizon.
5. Identify affected tenant, authorization, money, time, API, audit, job, and
   accessibility boundaries before editing.

Do not expand the MVP because a future capability is documented. Future briefs
guide compatibility decisions; they are not current implementation scope.

## Non-negotiable architecture

- Keep the TypeScript modular monolith with separately runnable web, API, and
  worker processes.
- All first-party and future clients use versioned HTTP API contracts. Clients
  do not import API internals or access PostgreSQL directly.
- PostgreSQL is the source of truth. Durable outbound work begins in the
  transactional outbox; queues are delivery infrastructure.
- Tenant data carries `business_id`. Preserve composite tenant foreign keys,
  forced row-level security, transaction-local tenant context, deny-by-default
  permissions, and venue scope.
- Enforce booking capacity and overlap correctness in PostgreSQL, not only in
  application checks.
- Keep authentication separate from application authorization. Tenant
  ownership never implies platform administration.
- Store money as exact integer minor units and time as instants plus the
  relevant IANA timezone and operational-date rules.
- Preserve append-only audit history, idempotency, safe retry behavior, and
  sensitive-value log redaction.
- Use shadcn/ui on Base UI through `packages/ui`, semantic tokens, and the
  existing accessibility conventions. Do not introduce a competing component
  library.
- Keep provider-specific code behind ports/adapters. No vendor type belongs in
  domain or public API contracts.

## Implementation workflow

- Prefer the smallest complete vertical slice that satisfies approved
  acceptance criteria.
- Put business rules in domain/application boundaries, persistence details in
  `packages/persistence`, and transport validation in the API boundary.
- Treat migrations as ordered, reviewed, forward changes. Never edit an
  already-applied migration.
- Update runtime schemas, OpenAPI, and the generated API client together when
  contracts change.
- Add tests at the cheapest reliable layer, but use real PostgreSQL for RLS,
  constraints, transactions, concurrency, and migration behavior.
- Update affected source-of-truth documents and the current handoff when a
  material decision, scope boundary, or implementation state changes.
- Do not commit, push, deploy, contact external people, or create paid
  resources unless the user asks.

## Verification

Use the narrow checks while iterating, then fresh completion evidence:

```sh
corepack pnpm ai:verify
corepack pnpm ai:verify:full
```

The full gate requires local infrastructure. See
[docs/ai/definition-of-done.md](docs/ai/definition-of-done.md) for
change-specific evidence and allowed exceptions. Never claim a command passed
unless it was run successfully in the current work.

## Public skills

Repository rules and accepted architecture override generic public skills.
Before adding a skill, review its complete instructions, scripts, external
commands, audit status, maintenance, overlap, and version assumptions. Record
the decision in
[docs/ai/public-skills-policy.md](docs/ai/public-skills-policy.md). Never use
popularity as the only trust signal.

## Finish every material task

Run `corepack pnpm ai:handoff` and update
[docs/ai/handoff.md](docs/ai/handoff.md) with the outcome, evidence, remaining
work, decisions, risks, and exact next step. The final response must distinguish
implemented, verified, deferred, and unverified work.
