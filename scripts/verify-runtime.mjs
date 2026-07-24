const requiredNodeVersion = "24.18.0"
const requiredPackageManager = {
  name: "pnpm",
  version: "11.17.0",
}

const actualNodeVersion = process.versions.node
const userAgent = process.env.npm_config_user_agent
const errors = []

if (actualNodeVersion !== requiredNodeVersion) {
  errors.push(
    `Node.js ${requiredNodeVersion} is required; the active version is ${actualNodeVersion}.`,
  )
}

if (userAgent) {
  const [packageManager] = userAgent.split(" ")
  const [name, version] = packageManager.split("/")

  if (
    name !== requiredPackageManager.name ||
    version !== requiredPackageManager.version
  ) {
    errors.push(
      `${requiredPackageManager.name} ${requiredPackageManager.version} is required; the active package manager is ${name ?? "unknown"} ${version ?? "unknown"}.`,
    )
  }
}

if (errors.length > 0) {
  console.error(
    [
      "Unsupported development runtime.",
      ...errors.map((error) => `- ${error}`),
      "Run the command through ./scripts/pnpmw so the repository can activate .node-version safely.",
    ].join("\n"),
  )
  process.exitCode = 1
} else {
  process.stdout.write(
    `Runtime verified: Node.js ${requiredNodeVersion}, ${requiredPackageManager.name} ${requiredPackageManager.version}.\n`,
  )
}
