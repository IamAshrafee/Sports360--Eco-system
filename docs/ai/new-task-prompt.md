# Fresh-Task Prompt

Use this when starting a new Codex task or another compatible coding agent:

```text
Continue the Sports Venue Management SaaS in this repository.

First read AGENTS.md and run `corepack pnpm ai:context`. Then use
docs/ai/context-map.md to load only the relevant source-of-truth documents.
Treat docs/ai/current-state.md and actual Git/test evidence as the current
checkpoint. Preserve unrelated changes and docs/others/.

Use the repository-local $sports-saas-engineering skill when available.
Repository rules and accepted ADRs override generic public skills.

My requested outcome is:
[replace this line with the task]

Before claiming completion, run the appropriate checks from
docs/ai/definition-of-done.md and update docs/ai/handoff.md with exact evidence,
risks, remaining work, and the best next action.
```

For a new task, replace only the requested-outcome line. The repository
contains the durable context; past chat transcripts should not be required.
