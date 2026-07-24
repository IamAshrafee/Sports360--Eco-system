# Engineering Implementation

Status: Active

This directory records what has actually been implemented. Architecture
documents describe intended constraints and decisions; engineering records
describe executable repository state, verification, and remaining work.

## Records

1. [Phase 4 engineering foundation](phase-4-foundation.md)
2. [Phase 5 configuration core](phase-5-configuration-core.md)
3. [Toolchain and version audit](toolchain-version-audit.md)
4. [Local development guide](local-development-guide.md)
5. [PostgreSQL backup and restore runbook](backup-restore-runbook.md)

## Documentation rule

Each engineering slice must state:

- implemented scope;
- important implementation decisions;
- commands that reproduce verification;
- known limitations and explicitly deferred work;
- the next dependency-safe slice.
