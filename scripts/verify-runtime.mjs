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
      "Activate the versions declared in .node-version and package.json, then retry.",
    ].join("\n"),
  )
  process.exitCode = 1
} else {
  process.stdout.write(
    `Runtime verified: Node.js ${requiredNodeVersion}, ${requiredPackageManager.name} ${requiredPackageManager.version}.\n`,
  )
}
