# Agent Working Protocol

Status: Active

## 1. Orient

- Inspect Git state without modifying it.
- Run `./scripts/pnpmw ai:context`.
- Confirm the current phase and whether the request is implementation,
  diagnosis, review, research, or documentation.
- Preserve unrelated changes and user-owned files.

## 2. Bound the work

- Route to the minimum source set using `context-map.md`.
- Name the accepted outcomes and acceptance criteria.
- Separate current delivery from compatibility for future capabilities.
- Record any assumption that could materially alter behavior.

## 3. Design the slice

- Follow module and API boundaries.
- Identify authorization and tenant scope.
- Identify concurrency, idempotency, audit, money, time, job, privacy, and
  accessibility implications.
- Prefer a complete thin vertical slice over disconnected infrastructure.

## 4. Implement

- Make focused, reviewable changes.
- Keep runtime validation and generated contracts aligned.
- Use exact project versions and existing package/tooling conventions.
- Add or change a dependency only after reviewing why it is necessary, its
  exact version, scripts, maintenance, and security implications.
- Never weaken a safety boundary merely to make a test pass.

## 5. Verify

- Run narrow tests while iterating.
- Run `./scripts/pnpmw ai:verify` before ordinary completion.
- Run `./scripts/pnpmw ai:verify:full` when shared contracts, persistence,
  infrastructure, build output, or release readiness is affected.
- Add focused concurrency, security, recovery, or accessibility evidence when
  the change touches those risks.

## 6. Reconcile documentation

Update the source of truth when the implementation changes:

- an approved decision;
- scope or phase state;
- a workflow or acceptance criterion;
- an API or schema contract;
- an operational procedure;
- a known risk or deferral.

Do not rewrite history in the decision log; supersede decisions explicitly.

## 7. Handoff

Run `./scripts/pnpmw ai:handoff`, then update `docs/ai/handoff.md`. A useful
handoff contains:

- outcome and exact files changed;
- fresh verification with pass/fail/not-run;
- decisions and assumptions;
- remaining work and risks;
- repository state and the single best next action.

Never place secrets, OTPs, tokens, personal data, or production credentials in
the handoff.
