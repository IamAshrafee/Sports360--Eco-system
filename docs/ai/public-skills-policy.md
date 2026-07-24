# Public Agent Skills Policy

Status: Active

Last reviewed: 2026-07-24

## Strategy

Use public skills for general, reusable expertise. Keep only project-specific
architecture, scope, terminology, commands, and verification routing in the
repository skill.

Public skills are executable instructions, not passive articles. Installation
requires an exact skill choice and a review of:

1. the complete `SKILL.md` and bundled scripts/resources;
2. repository owner, maintenance, and licensing;
3. external commands, network access, package runners, and generated files;
4. security-audit results and unresolved warnings;
5. overlap with Codex's built-in behavior and repository tooling;
6. compatibility with pinned versions and accepted ADRs;
7. the smallest installation scope that solves the need.

Popularity can help discovery but never establishes trust. Re-review an
installed skill before accepting a materially changed upstream version.

## Evaluation

| Skill | Decision | Reason |
|---|---|---|
| [Vercel React Best Practices](https://www.skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) | Recommended first | Strong fit for Next.js/React performance, recognizable maintainer, and passing listed audits. Project UI/API boundaries still override generic advice. |
| [Systematic Debugging](https://www.skills.sh/obra/superpowers/systematic-debugging) | Recommended | General evidence-first debugging with little product-specific overlap and passing listed audits. |
| [Supabase PostgreSQL Best Practices](https://www.skills.sh/supabase/agent-skills/supabase-postgres-best-practices) | Optional after full source review | Useful PostgreSQL guidance and passing listed audits, but Supabase-specific assumptions must not enter this plain PostgreSQL/Kysely architecture. |
| [Handoff](https://www.skills.sh/mattpocock/skills/handoff) | Defer | Passing listed audits and sensible redaction, but it writes temporary handoffs while this project needs a versioned repository handoff. Installing both would duplicate responsibility. |
| [shadcn](https://www.skills.sh/shadcn/ui/shadcn) | Defer pending adaptation | Relevant and upstream-owned, but its documented `@latest` commands conflict with this repository's exact-version policy, and one listed audit is a warning. |
| [Playwright CLI](https://www.skills.sh/microsoft/playwright-cli/playwright-cli) | Do not install now | Useful later for browser testing, but one listed audit currently fails and the repository already has browser/testing paths. Re-evaluate when Phase 5 E2E work begins. |
| [Web App Testing](https://www.skills.sh/anthropics/skills/webapp-testing) | Re-evaluate in Phase 5 | Passing listed audits, but its Python helper may duplicate the JavaScript/browser tooling selected for this repository. |
| [Verification Before Completion](https://www.skills.sh/obra/superpowers/verification-before-completion) | Do not install | Good principle, but `AGENTS.md` and `definition-of-done.md` already enforce it; duplication adds instruction noise. |

## Precedence

When an approved public skill is active:

1. the user's request controls the outcome;
2. `AGENTS.md` and `$sports-saas-engineering` control project boundaries;
3. accepted product decisions and ADRs control design;
4. the public skill contributes generic technique within those constraints.

If a public skill asks for `@latest`, weakens tenant or database enforcement,
introduces an unapproved framework/provider, broadens MVP scope, or claims
completion without repository evidence, stop following that instruction and
record the conflict.

## Installation record

No public skill has been installed by this review. Exact installation remains
an explicit, reviewable change rather than an automatic bundle.
