import { execFileSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown Git failure"
    return `[unavailable: ${message}]`
  }
}

const branch = git(["branch", "--show-current"])
const head = git(["log", "-1", "--oneline"])
const status = git(["status", "--short"]) || "(clean)"
const changed = git(["diff", "--stat"]) || "(no unstaged diff)"

process.stdout.write(`Sports Venue SaaS — handoff snapshot

Branch: ${branch}
HEAD: ${head}

Working tree:
${status}

Unstaged diff:
${changed}

Update docs/ai/handoff.md with:

1. Outcome — what is now true for the user.
2. Files — important paths changed; do not duplicate their full content.
3. Verification — exact commands and pass/fail/not-run results.
4. Decisions — choices, assumptions, and scope boundaries.
5. Risks — unresolved correctness, security, migration, or operational issues.
6. Remaining work — only real work that remains.
7. Repository state — branch, HEAD, and preserved unrelated changes.
8. Next action — one concrete best continuation step.

Redact secrets, credentials, tokens, OTPs, personal data, and private provider
details. Do not mark planned, mocked, or unverified behavior as complete.
`)
