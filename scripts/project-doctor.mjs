import { execFileSync } from "node:child_process"
import { accessSync, constants, existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packageJson = JSON.parse(
  readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
)
const workspaceConfig = readFileSync(
  resolve(repositoryRoot, "pnpm-workspace.yaml"),
  "utf8",
)
const requiredNodeVersion = packageJson.devEngines.runtime.version
const requiredNodeMajor = Number(requiredNodeVersion.split(".")[0])
const requiredPnpmVersion = packageJson.packageManager.replace("pnpm@", "")
const requireInfrastructure = process.argv.includes("--full")
const failures = []
const warnings = []

function pass(label, detail) {
  process.stdout.write(`PASS  ${label}: ${detail}\n`)
}

function fail(label, detail) {
  failures.push(`${label}: ${detail}`)
  process.stdout.write(`FAIL  ${label}: ${detail}\n`)
}

function warn(label, detail) {
  warnings.push(`${label}: ${detail}`)
  process.stdout.write(`WARN  ${label}: ${detail}\n`)
}

function readVersionFile(path) {
  return readFileSync(resolve(repositoryRoot, path), "utf8").trim()
}

function run(command, args) {
  try {
    return {
      ok: true,
      output: execFileSync(command, args, {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim(),
    }
  } catch (error) {
    return {
      ok: false,
      output:
        error instanceof Error
          ? error.message
          : "unknown command execution failure",
    }
  }
}

function checkExecutable(path, label) {
  try {
    accessSync(resolve(repositoryRoot, path), constants.X_OK)
    pass(label, path)
  } catch {
    fail(label, `${path} is missing or not executable`)
  }
}

process.stdout.write("Sports Venue SaaS — project doctor\n")
process.stdout.write(`Repository: ${repositoryRoot}\n`)
process.stdout.write(`Node executable: ${process.execPath}\n\n`)

if (process.versions.node === requiredNodeVersion) {
  pass("Node.js", process.versions.node)
} else {
  fail(
    "Node.js",
    `expected ${requiredNodeVersion}, received ${process.versions.node}`,
  )
}

const pnpm = run("corepack", ["pnpm", "--version"])
if (pnpm.ok && pnpm.output === requiredPnpmVersion) {
  pass("pnpm", pnpm.output)
} else {
  fail(
    "pnpm",
    `expected ${requiredPnpmVersion}, received ${pnpm.output || "unavailable"}`,
  )
}

for (const path of [".node-version", ".nvmrc"]) {
  const declaredVersion = readVersionFile(path)
  if (declaredVersion === requiredNodeVersion) {
    pass(path, declaredVersion)
  } else {
    fail(path, `expected ${requiredNodeVersion}, received ${declaredVersion}`)
  }
}

const expectedNodeEngine = `>=${requiredNodeVersion} <${requiredNodeMajor + 1}`
if (packageJson.engines.node === expectedNodeEngine) {
  pass("package engines", packageJson.engines.node)
} else {
  fail(
    "package engines",
    `expected ${expectedNodeEngine}, received ${packageJson.engines.node}`,
  )
}

const workspaceNodeVersion = workspaceConfig.match(
  /^nodeVersion:\s*["']?([^"'\s]+)["']?\s*$/m,
)?.[1]
if (workspaceNodeVersion === requiredNodeVersion) {
  pass("pnpm workspace Node.js", workspaceNodeVersion)
} else {
  fail(
    "pnpm workspace Node.js",
    `expected ${requiredNodeVersion}, received ${workspaceNodeVersion ?? "missing"}`,
  )
}

if (
  packageJson.devEngines.packageManager.version === requiredPnpmVersion &&
  packageJson.engines.pnpm === requiredPnpmVersion
) {
  pass("package pnpm declarations", requiredPnpmVersion)
} else {
  fail(
    "package pnpm declarations",
    "packageManager, devEngines, and engines do not agree",
  )
}

if (existsSync(resolve(repositoryRoot, "pnpm-lock.yaml"))) {
  pass("lockfile", "pnpm-lock.yaml exists")
} else {
  fail("lockfile", "pnpm-lock.yaml is missing")
}

checkExecutable("node_modules/.bin/eslint", "dependency executable links")

if (
  existsSync(resolve(repositoryRoot, "packages/api-client/dist/index.js")) &&
  existsSync(resolve(repositoryRoot, "packages/api-client/dist/index.d.ts"))
) {
  pass("generated client build", "JavaScript and declarations exist")
} else {
  fail(
    "generated client build",
    "run ./scripts/pnpmw --filter @sports/api-client build",
  )
}

const docker = run("docker", ["compose", "ps", "--format", "json"])
if (!docker.ok) {
  const report = "Docker Compose is unavailable or not running"
  if (requireInfrastructure) fail("local infrastructure", report)
  else warn("local infrastructure", `${report}; required only for full gates`)
} else {
  const serviceLines = docker.output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const services = serviceLines.flatMap((line) => {
    try {
      return [JSON.parse(line)]
    } catch {
      return []
    }
  })
  const expectedServices = ["postgres", "valkey"]
  const unhealthy = expectedServices.filter((serviceName) => {
    const service = services.find(
      ({ Service, service }) => (Service ?? service) === serviceName,
    )
    const health = service?.Health ?? service?.health
    const state = service?.State ?? service?.state
    return service === undefined || state !== "running" || health !== "healthy"
  })

  if (unhealthy.length === 0) {
    pass("local infrastructure", "PostgreSQL and Valkey are healthy")
  } else {
    const report = `not healthy: ${unhealthy.join(", ")}`
    if (requireInfrastructure) fail("local infrastructure", report)
    else warn("local infrastructure", `${report}; run ./scripts/pnpmw infra:up`)
  }
}

process.stdout.write(
  `\nResult: ${failures.length} failure(s), ${warnings.length} warning(s).\n`,
)

if (failures.length > 0) {
  process.exitCode = 1
}
