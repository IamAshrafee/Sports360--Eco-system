# Toolchain and Version Audit

Status: Verified

Date: 2026-07-24

## Audit conclusion

The repository is installed correctly and reproducibly after the corrections
recorded below. The machine has both Node.js 26 and Node.js 24 installed; Node
26 is first on the default shell path. The project intentionally requires Node
24.18.0 LTS and now rejects accidental use of Node 26.

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
| Better Auth | 1.6.23 | Latest mature release accepted by the 24-hour package-age policy |
| BullMQ | 5.80.9 | Latest mature release accepted when the newer release was under 24 hours old |
| Hey API OpenAPI TS | 0.99.0 | Mature generator with explicit TypeScript 6 peer support |

Node.js 26 is a Current release, not the project runtime. `.node-version`,
`.nvmrc`, `devEngines`, package engines, pnpm configuration, the preinstall
hook, CI, and `verify:runtime` all agree on Node.js 24.18.0.

## Deliberately retained compatible majors

| Package | Selected | Newer major | Decision |
|---|---:|---:|---|
| TypeScript | 6.0.3 | 7.0.2 | Retain 6 because the installed TypeScript ESLint toolchain currently declares support below 6.1 |
| ESLint | 9.39.5 | 10.7.0 | Retain 9 because the complete Next.js lint plugin graph passes peer checks on ESLint 9 |

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

- frozen lockfile installation: pass;
- peer dependency check: pass;
- complete dependency audit: no known vulnerabilities;
- lint: pass with zero warnings;
- strict type checking: pass;
- tests: pass;
- optimized production builds: pass;
- shadcn CLI workspace resolution: pass.

## Local workstation activation

Before working, the shell must report:

```text
node --version
v24.18.0

corepack pnpm --version
11.17.0
```

Use the installed version manager to activate `.node-version` or run `nvm use`
when nvm is installed. Do not continue after the runtime guard reports Node.js
26 or another version.
