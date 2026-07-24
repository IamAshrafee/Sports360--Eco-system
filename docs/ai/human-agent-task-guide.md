# Human Guide for Assigning Work to Agentic AI

Status: Active operating guide

This guide is for the solo human developer directing an agent to plan, build,
debug, review, or document this project. The repository carries the durable
context; the human supplies the desired outcome, scope, and authority for the
current task.

## Division of responsibility

The human owns:

- choosing the next business outcome;
- approving scope, trade-offs, and externally consequential actions;
- deciding when a result is acceptable enough to checkpoint;
- reviewing anything the agent identifies as uncertain or high risk.

The agent owns:

- finding the relevant repository evidence;
- identifying contradictions, dependencies, and safety boundaries;
- producing a focused plan for material work;
- implementing the requested outcome within scope;
- running proportionate verification;
- recording an honest handoff.

The human does not need to repeat the project history in every prompt. The
agent must read `AGENTS.md`, run `./scripts/pnpmw ai:context`, and use the
repository context map.

## The task-assignment cycle

### 1. Choose one outcome

Describe what should become true for a user or the system. Prefer:

> An authorized owner can create an activity, independent resource, and
> offering and later retrieve the same tenant-scoped configuration.

Avoid:

> Work on the backend.

One task may cross database, API, generated client, and UI when those parts
form one complete behavior. Do not combine unrelated product outcomes merely
because they touch the same package.

### 2. State the task type

Use one of these verbs:

| Type | Expected agent behavior |
|---|---|
| Plan | Inspect and produce an implementation-ready plan; do not build it |
| Diagnose | Find and explain the root cause; do not fix unless asked |
| Implement | Build, test, document, and hand off the requested outcome |
| Review | Inspect and report evidence-backed risks; do not mutate |
| Research | Gather evidence and distinguish facts from assumptions |
| Continue | Resume the exact next action in `docs/ai/handoff.md` |

This avoids accidental implementation when only analysis was wanted.

### 3. Define scope and exclusions

Name the included behavior and the most tempting adjacent behavior that must
remain out of scope. For Phase 5, a useful exclusion is:

> Staff-side configuration only; do not build public publication or customer
> checkout.

If you do not know every technical file, that is fine. Specify the product
boundary and let the agent find the implementation surface.

### 4. Point to acceptance evidence

Use story, workflow, acceptance-criterion, or task-brief identifiers where
available:

```text
Workflow: WF-CFG-001
Stories: US-CFG-002
Acceptance: AC-CFG-002, AC-AUTH-006, AC-NFR-003
Task brief: docs/planning/phase-5/P5-01-configuration-core.md
```

If no identifier exists, ask the agent to identify the gap before implementing
a broad interpretation.

Before assigning any phase task, consult
`docs/planning/all-phase-delivery-index.md`. A task brief marked
implementation-ready can still be blocked by its phase entry gate. Do not ask
an agent to bypass that status.

### 5. Set authority

Ordinary repository reading, editing, local tests, and generated artifacts
needed by the requested implementation are normally in scope. State explicit
approval for actions with wider consequences:

| Action | Human approval |
|---|---|
| Read code/docs, edit scoped files, run local checks | Implied by an implementation request |
| Add or update a dependency | Explicit reason and exact version review |
| Install an agent skill/plugin | Exact named item and source |
| Commit, push, create PR | Explicit request |
| Deploy or change production/cloud resources | Explicit target and approval |
| Contact customers/owners/staff | Explicitly prohibited by the active roadmap |
| Delete data/files, reset Git, rewrite migrations/history | Exact target and explicit approval |

### 6. Let the agent work, but watch the boundaries

Useful progress updates should say what was learned, what changed, which risk
is being tested, or why a decision is required. Intervene when:

- the agent expands into public booking or another future phase;
- it proposes weakening RLS, database constraints, idempotency, audit, or exact
  money rules;
- it silently introduces a provider or framework;
- it edits an applied migration;
- it begins a destructive or external action that was not approved;
- repeated fixes are attempted without a demonstrated root cause.

### 7. Review the result, not only the summary

At handoff, confirm:

1. the requested user/system outcome is actually present;
2. the diff contains no unrelated work;
3. tests named in the final response really passed;
4. deferred or unverified behavior is clearly labelled;
5. generated API/schema artifacts match their runtime source;
6. `docs/ai/handoff.md` names the next action;
7. Git status is understood before committing.

For a high-risk slice, ask the agent to demonstrate the failing/denied path as
well as the successful path.

## Recommended task brief

Copy this structure into a prompt or task file:

```text
Task ID and title:

Task type:
Plan | Diagnose | Implement | Review | Research | Continue

Outcome:
One sentence describing what becomes true.

In scope:
- ...

Out of scope:
- ...

Source requirements:
- workflow/story/acceptance IDs
- relevant task brief or product document

Safety boundaries:
- tenant/venue authorization
- money/time/concurrency/audit/idempotency/accessibility as applicable

Expected deliverables:
- behavior/API/UI/migration/docs/tests

Verification:
- minimum commands or proof scenarios

Authority:
- whether dependency changes, commits, pushes, deployments, or external
  actions are allowed

Stop and ask when:
- list only decisions that would materially change the product or risk
```

The outcome, scope, acceptance evidence, and authority are the essential
fields. The agent can infer ordinary implementation details from the
repository.

## Standard prompt for this project

```text
Use $sports-saas-engineering.

Implement [TASK ID/title] from [task-brief path].

Outcome: [one concrete outcome].

Keep [adjacent feature] out of scope. Preserve unrelated work and follow the
repository's current Phase 5 boundary.

Trace the change to its workflows, stories, acceptance criteria, domain
invariants, API contract, persistence rules, UI behavior, and tests. Use
$vercel-react-best-practices if React/Next.js code is materially involved. Use
$systematic-debugging if an existing failure or unexpected behavior appears.

You may edit scoped repository files and run local verification. Do not add
dependencies, commit, push, deploy, contact external people, or perform
destructive actions without explicit approval.

Finish by updating docs/ai/handoff.md and report implemented, verified,
deferred, and unverified items separately.
```

Installed public skills become available to a new agent task after
installation. The repository skill and `AGENTS.md` always take precedence.

## Short prompts for common situations

### Continue the planned next task

```text
Use $sports-saas-engineering and continue the exact next action recorded in
docs/ai/handoff.md. Confirm it still matches docs/ai/current-state.md and Git
state before editing. Do not broaden the phase.
```

### Diagnose without changing code

```text
Use $sports-saas-engineering and $systematic-debugging. Diagnose [symptom].
Reproduce it, trace the root cause, and report evidence and the smallest safe
fix. Do not implement the fix yet.
```

### Review an implementation

```text
Review [commit/diff/task] against [task brief and acceptance IDs]. Focus on
tenant isolation, authorization, concurrency, idempotency, money/time,
contract compatibility, accessibility, and missing tests. Do not edit files.
```

## Task-sizing rule

A good agent task has:

- one primary outcome;
- one coherent set of invariants;
- one demonstrable success path;
- the relevant denial/error paths;
- a verification boundary that can finish in one task.

Split the task when it contains multiple independently valuable outcomes or
would require the agent to keep more than one major domain transition in mind.
Do not split one atomic business behavior merely to keep each layer in a
different task.

For example, “create an offering” may include migration, domain code, API,
generated client, setup form, and tests. “Create an offering plus implement
refund reconciliation” is two tasks.

## Human checkpoint checklist

Before creating a Git checkpoint:

- [ ] The task brief and final outcome agree.
- [ ] All changed files are intentional.
- [ ] No secret, OTP, token, personal data, or production credential is added.
- [ ] Applied migrations were not edited.
- [ ] Required generated files are updated.
- [ ] `./scripts/pnpmw ai:verify` passed.
- [ ] Any required PostgreSQL/integration/full gate passed.
- [ ] Manual or external checks that were not run are listed.
- [ ] `docs/ai/current-state.md` and `docs/ai/handoff.md` are accurate.
- [ ] The commit message describes an outcome, not vague activity.

## If the task or conversation becomes too large

Do not keep expanding the same prompt. Ask the agent to:

1. stop at a coherent verified boundary;
2. update `docs/ai/handoff.md`;
3. record remaining work as ordered task briefs;
4. leave the working tree understandable;
5. continue in a fresh task using the short continuation prompt.

This makes conversation length an operational detail rather than a project
risk.
