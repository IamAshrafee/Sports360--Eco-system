import { writeFile } from "node:fs/promises"

import type { SportsAuth } from "@sports/auth"
import type { Pool } from "pg"

import { buildApp } from "./app.js"
import { readApiConfig } from "./config.js"

const config = readApiConfig({
  BETTER_AUTH_SECRET: "openapi-generation-secret-at-least-32-characters",
  NODE_ENV: "test",
})
const auth = {
  api: { getSession: async () => null },
  handler: async () => new Response(null, { status: 404 }),
} as unknown as SportsAuth
const runtimePool = {
  query: async () => ({ rows: [] }),
} as unknown as Pool
const app = await buildApp({
  auth: { auth, runtimePool },
  config,
  logger: false,
})

try {
  await app.ready()
  const document = app.swagger()
  await writeFile(
    new URL("../../../docs/specification/openapi.json", import.meta.url),
    `${JSON.stringify(document, null, 2)}\n`,
  )
  process.stdout.write("OpenAPI document generated.\n")
} finally {
  await app.close()
}
