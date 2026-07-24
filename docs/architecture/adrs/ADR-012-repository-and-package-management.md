# ADR-012: pnpm Workspace Without an Initial Build Orchestrator

Status: Accepted
Date: 2026-07-24

## Context

Web, API, worker, database tooling, generated client code, and shared domain
contracts belong in one repository. The structure must enforce package
boundaries without forcing a solo developer to operate unnecessary monorepo
infrastructure.

## Decision

- Use one pnpm workspace and one committed lockfile.
- Put deployable processes under `apps/` and reusable packages under
  `packages/`.
- Reference internal packages with the `workspace:` protocol.
- Fail CI on workspace dependency cycles.
- Use pnpm filtering/recursive commands for build, test, lint, and deployment
  at the start.
- Build isolated production artifacts/containers for web, API, and worker.
- Do not add Turborepo, Nx, or remote caching initially.
- Add a build orchestrator only when measured CI/local build time, task-graph
  complexity, or repository size creates a clear benefit.

The initial package map is:

```text
apps/web
apps/api
apps/worker
packages/domain-*
packages/application-*
packages/database
packages/api-contract
packages/auth
packages/integrations
packages/observability
packages/config
packages/test-support
packages/ui
```

Exact package granularity is finalized while scaffolding; packages must reflect
real dependency boundaries, not one package per entity.

## Alternatives

- Separate repositories: increases cross-repository versioning and atomic-change
  overhead before independent release ownership exists.
- Turborepo immediately: reasonable, but one more configuration/cache layer
  before build performance is measured.
- npm workspaces: viable, but pnpm provides strict workspace linking, filtering,
  and efficient isolated deployment support suited to these deployables.

## Consequences

- One pull request can change database, API contract, generated client, and web
  use atomically.
- Boundary linting and package exports are required to prevent a monorepo from
  becoming an unstructured monolith.
- Package versions are not published merely to communicate within the
  repository.

## Migration and reversal path

An orchestrator can be layered over existing package scripts. Individual
applications can later move to separate repositories if service/team ownership
justifies the release and contract-management cost.

## References

- [pnpm workspaces](https://pnpm.io/workspaces)
- [pnpm deploy](https://pnpm.io/cli/deploy)

## Traceability

ADR-001; ADR-002; NFR-MNT-001–006.
