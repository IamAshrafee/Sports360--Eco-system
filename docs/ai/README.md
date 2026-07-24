# AI Collaboration System

Status: Active

This directory makes the project resumable across agents, tasks, and chat
length limits. It supplements—not replaces—the product, specification,
architecture, and engineering sources in `docs/`.

## Files

- [Current state](current-state.md): the phase boundary and implementation
  checkpoint.
- [Context map](context-map.md): which sources to read for each kind of task.
- [Working protocol](working-protocol.md): the repeatable agent workflow.
- [Definition of done](definition-of-done.md): required completion evidence.
- [Handoff](handoff.md): the compact continuation record.
- [New-task prompt](new-task-prompt.md): a reusable prompt for a fresh task.
- [Human task-assignment guide](human-agent-task-guide.md): how the solo
  developer should scope, assign, supervise, and accept agent work.
- [Public-skills policy](public-skills-policy.md): review and adoption rules.

Repository-wide instructions live in [AGENTS.md](../../AGENTS.md). The
project-specific reusable skill lives in
`.agents/skills/sports-saas-engineering`.

## Quick start

```sh
./scripts/pnpmw ai:context
```

Then read the documents listed for the task in
[context-map.md](context-map.md). Before claiming completion, use the
appropriate verification level and refresh [handoff.md](handoff.md).
