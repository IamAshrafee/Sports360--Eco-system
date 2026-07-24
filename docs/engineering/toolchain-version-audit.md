# Toolchain and Version Audit

Status: Verified

Date: 2026-07-24

## Audit conclusion

The repository is installed correctly and reproducibly after the corrections
recorded below. The machine has both Node.js 26 and Node.js 24 installed; Node
26 is first on some non-interactive command paths. The project intentionally
requires Node 24.18.0 LTS. The repository wrapper now activates `.nvmrc`
through NVM before invoking pnpm instead of depending on the caller's PATH.

The project chooses the newest compatible and supportable version, not
automatically the numerically newest major version.

## Runtime

| Item | Project version | Reason |
|---|---:|---|
| Node.js | 24.18.0 | Latest LTS; production applications should use an LTS line |
| pnpm | 11.17.0 | Current stable package manager; exact version is pinned |
| Next.js | 16.2.11 | Current stable release |
| React / React DOM | 19.2.8 | Current stable release and supported by Next.js |
| PostgreSQL | 18.4 | Current supported PostgreSQL release used by local and CI services |
| Valkey | 9.1.0 | Current stable queue/cache service used by local and CI services |
| Better Auth | 1.6.23 | Verified compatible patch; newer patches require the normal age and quality gates |
| BullMQ | 5.80.9 | Verified compatible patch; newer patches require the normal age and queue gates |
| Hey API OpenAPI TS | 0.99.0 | Mature generator with explicit TypeScript 6 peer support |

Node.js 26 is a Current release, not the project runtime. `.node-version`,
`.nvmrc`, `devEngines`, package engines, pnpm configuration, the preinstall
hook, CI, and `verify:runtime` all agree on Node.js 24.18.0.

## Deliberately retained compatible majors

| Package | Selected | Newer major | Decision |
|---|---:|---:|---|
| TypeScript | 6.0.3 | 7.0.2 | Retain 6 because the installed TypeScript ESLint toolchain currently declares support below 6.1 |
| ESLint | 9.39.5 | 10.7.0 | Retain the already verified major until an isolated ESLint 10 migration passes the complete plugin and quality gates |

These are compatibility decisions, not forgotten upgrades. They should be
revisited when the complete lint/type ecosystem declares support and the
quality gate passes.

## shadcn/ui

shadcn/ui is a source-code generator and component convention, not a runtime
component package that must remain in application dependencies.

Verified configuration:

- both `apps/web` and `packages/ui` have `components.json`;
- both use `base-nova`, Base UI, TypeScript, React Server Components, Tailwind
  CSS v4, CSS variables, neutral base color, and Lucide icons;
- package `imports` define local `#components`, `#hooks`, and `#lib` aliases;
- app UI aliases resolve to `packages/ui/src/components`;
- app utility aliases resolve to `packages/ui/src/lib/utils.ts`;
- Button, Badge, and Card are detected as installed components;
- the official CLI resolves every configured destination correctly.

New shared primitives must be generated from `apps/web` or `packages/ui` and
must remain in `packages/ui`. App-specific composed blocks may live under the
web application.

## Dependency freshness and security

The audit updated React types and Lucide to mature compatible releases allowed
by the 24-hour package-age policy.

The current stable Next.js release still requests vulnerable transitive
versions of Sharp and PostCSS. The OpenAPI generator also permits a vulnerable
YAML parser release. The workspace temporarily enforces:

- `js-yaml` 4.3.0;
- `sharp` 0.35.3;
- `postcss` 8.5.22.

The optimized production build passes with both patched versions. These
overrides should be removed when a stable Next.js release requests patched
versions itself.

Verification results:

- Node.js 26 caller → wrapper-selected Node.js 24.18.0: pass;
- correct-runtime and missing-NVM wrapper paths: pass;
- project doctor with PostgreSQL and Valkey: pass with zero warnings;
- frozen lockfile installation: pass;
- peer dependency check: pass;
- complete dependency audit: no known vulnerabilities;
- lint: pass with zero warnings;
- strict type checking: pass;
- tests: pass;
- optimized production builds: pass;
- shadcn CLI workspace resolution: pass.

## Canonical project entry

Run every project command through:

```sh
./scripts/pnpmw project:doctor
```

`scripts/pnpmw` reads `.node-version`, keeps an already-correct runtime, or
loads NVM and activates the exact declared Node.js version. It fails with an
installation instruction when that version is unavailable and never silently
installs or upgrades a runtime.

The project doctor verifies:

- the actual Node executable and exact Node/pnpm versions;
- agreement between `.node-version`, `.nvmrc`, and package engines;
- lockfile presence and dependency executable links;
- the compiled generated-client boundary;
- optional PostgreSQL and Valkey health.

Use `./scripts/pnpmw project:doctor:full` when the task needs local
infrastructure. CI may use direct `pnpm` because its workflow installs the
exact declared Node and pnpm versions before any project command.
