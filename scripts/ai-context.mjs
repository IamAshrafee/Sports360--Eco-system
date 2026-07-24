import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function run(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown command failure"
    return `[unavailable: ${message}]`
  }
}

function section(title, value) {
  process.stdout.write(`\n${title}\n${value || "(none)"}\n`)
}

const packageJsonPath = resolve(repositoryRoot, "package.json")
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
const requiredFiles = [
  "AGENTS.md",
  "docs/ai/current-state.md",
  "docs/ai/context-map.md",
  "docs/ai/definition-of-done.md",
  "docs/ai/handoff.md",
  ".agents/skills/sports-saas-engineering/SKILL.md",
]

process.stdout.write("Sports Venue SaaS — agent context\n")
process.stdout.write(`Repository: ${repositoryRoot}\n`)
process.stdout.write(
  `Required runtime: Node ${packageJson.devEngines.runtime.version}, pnpm ${packageJson.packageManager.replace("pnpm@", "")}\n`,
)
process.stdout.write(`Current Node: ${process.version}\n`)

section("Branch", run("git", ["branch", "--show-current"]))
section("HEAD", run("git", ["log", "-1", "--oneline"]))
section(
  "Origin divergence (left=origin/main, right=HEAD)",
  run("git", ["rev-list", "--left-right", "--count", "origin/main...HEAD"]),
)
section("Working tree", run("git", ["status", "--short"]))

section(
  "Continuity files",
  requiredFiles
    .map(
      (path) =>
        `${existsSync(resolve(repositoryRoot, path)) ? "ok" : "MISSING"}  ${path}`,
    )
    .join("\n"),
)

process.stdout.write(`
Read next:
1. AGENTS.md
2. docs/ai/current-state.md
3. docs/ai/context-map.md
4. only the task-specific sources routed by the context map

Current delivery boundary: Phase 5 staff-side booking implementation is active.
Read docs/ai/current-state.md for the completed slice and exact next action.
Future briefs guide compatibility and do not authorize scope expansion.
`)
