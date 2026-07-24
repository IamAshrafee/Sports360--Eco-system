# Sports Venue Management SaaS

Bangladesh-focused sports-venue business management SaaS.

The product is intended to become the daily operating system for independently
operated sports venues: resources, availability, bookings, customers, payments,
venue operations, and owner reporting in one multi-tenant SaaS.

## Current phase

Phase 4 engineering foundation is complete. Phase 5 implementation is active:
P5-01 provides tenant-owned activity, independent-resource, and
fixed-duration offering configuration across PostgreSQL, `/v1`, the generated
client, and the shadcn-based setup UI. P5-02 adds effective venue/resource
schedules, exceptions, and timezone-aware fixed-slot preview. P5-03 price,
policy, and add-ons is the next bounded slice.

Start with the [documentation index](docs/README.md).

## Planned application shape

```text
apps/web       Next.js first-party web client
apps/api       Fastify application API
apps/worker    asynchronous worker
packages/ui    shared shadcn/ui design system
packages/api-client  generated client for web/mobile/integrations
packages/persistence PostgreSQL migrations and tenant context
packages/auth        Better Auth and OTP provider boundary
```

The repository pins Node.js 24 LTS and pnpm through `.node-version`, `.nvmrc`,
`package.json`, and the lockfile.

## Local setup

Prerequisites:

- Node.js `24.18.0`
- Corepack (included with the supported Node toolchain)
- NVM when the shell may select another installed Node.js version
- Docker Desktop or another Docker Compose-compatible runtime

Use the repository wrapper for every project command. It activates `.nvmrc`
through NVM when a non-interactive shell accidentally selects another Node.js
installation:

```bash
./scripts/pnpmw project:doctor
```

The doctor must report Node.js `24.18.0`, pnpm `11.17.0`, healthy dependency
links, and a built generated client. Local PostgreSQL and Valkey are reported
separately because they are required only for infrastructure/full gates.

The wrapper requires NVM when the active shell does not already use the
declared Node.js version. It never installs or silently upgrades a runtime.

On macOS, the recommended daily workflow is to double-click
`Start Development.command` in Finder. The matching Restart, Status, and Stop
launchers safely control the same supervised environment. See the
[local development guide](docs/engineering/local-development-guide.md) for
behavior, URLs, logs, and manual recovery.

```bash
./scripts/pnpmw install --frozen-lockfile
./scripts/pnpmw infra:up
./scripts/pnpmw project:doctor:full
./scripts/pnpmw api:generate
./scripts/pnpmw check
./scripts/pnpmw test:integration
./scripts/pnpmw build
```

The one-command terminal equivalent starts and supervises all three processes:

```bash
./scripts/dev-environment.sh start
```

The manual fallback is to run each process in a separate terminal:

```bash
./scripts/pnpmw dev:web
./scripts/pnpmw dev:api
./scripts/pnpmw dev:worker
```

Copy `.env.example` to `.env` when local values need to differ from the safe
development defaults. Never commit the resulting `.env`.

The engineering implementation record is in
[docs/engineering/phase-4-foundation.md](docs/engineering/phase-4-foundation.md).
The exact version rationale and latest audit are in
[docs/engineering/toolchain-version-audit.md](docs/engineering/toolchain-version-audit.md).

## Working principles

- Bangladesh-first and international-ready.
- Venue businesses are the paying customers.
- Staff-assisted and customer-created bookings share one availability engine.
- Everyday workflows stay simple while the domain model remains extensible.
- Confirmed decisions, assumptions, research, and future ideas are documented
  separately.
- The private pilot proves real venue operations before wider feature expansion.
