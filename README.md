# Sports Venue Management SaaS

Bangladesh-focused sports-venue business management SaaS.

The product is intended to become the daily operating system for independently
operated sports venues: resources, availability, bookings, customers, payments,
venue operations, and owner reporting in one multi-tenant SaaS.

## Current phase

Phase 4 engineering foundation is complete. The repository now includes the
web/API/worker processes, shared shadcn/ui system, PostgreSQL tenancy and
authorization, Better Auth phone identity, audit/outbox foundations, generated
OpenAPI client, observability boundary, and exercised backup/restore tooling.
Phase 5 staff-side booking core is the next planned phase.

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
- Docker Desktop or another Docker Compose-compatible runtime

Before installing, verify the active shell:

```bash
node --version
corepack pnpm --version
```

The output must be `v24.18.0` and `11.17.0`. A version manager that reads
`.node-version` or `.nvmrc` is recommended. Run `nvm use` when using nvm.
Installation and the complete quality gate fail early when another runtime is
active.

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm infra:up
corepack pnpm api:generate
corepack pnpm check
corepack pnpm test:integration
corepack pnpm build
```

Run each process in a separate terminal:

```bash
corepack pnpm dev:web
corepack pnpm dev:api
corepack pnpm dev:worker
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
