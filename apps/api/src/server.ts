import {
  createAuth,
  DisabledOtpProvider,
  type AuthEnvironment,
} from "@sports/auth"
import { startObservability } from "@sports/observability"
import { createPool } from "@sports/persistence"

import { buildApp } from "./app.js"
import { readApiConfig } from "./config.js"

const config = readApiConfig()
const observability = await startObservability({
  endpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
  serviceName: "sports-api",
})
const authPool = createPool(config.DATABASE_AUTH_URL)
const runtimePool = createPool(config.DATABASE_RUNTIME_URL)
const authConfig: AuthEnvironment = {
  BETTER_AUTH_BASE_URL: config.BETTER_AUTH_BASE_URL,
  BETTER_AUTH_SECRET: config.BETTER_AUTH_SECRET,
  DATABASE_AUTH_URL: config.DATABASE_AUTH_URL,
  NODE_ENV: config.NODE_ENV,
}
const auth = createAuth({
  authPool,
  config: authConfig,
  otp: new DisabledOtpProvider(),
  trustedOrigins: config.API_CORS_ORIGINS,
})
const app = await buildApp({
  auth: { auth, runtimePool },
  config,
  readiness: async () => {
    await runtimePool.query("SELECT 1")
  },
})

app.addHook("onClose", async () => {
  await Promise.all([
    authPool.end(),
    runtimePool.end(),
    observability.shutdown(),
  ])
})

const shutdown = async (signal: NodeJS.Signals) => {
  app.log.info({ signal }, "shutdown requested")
  await app.close()
}

process.once("SIGINT", () => {
  void shutdown("SIGINT")
})
process.once("SIGTERM", () => {
  void shutdown("SIGTERM")
})

try {
  await app.listen({
    host: config.API_HOST,
    port: config.API_PORT,
  })
} catch (error) {
  app.log.fatal({ error }, "API failed to start")
  process.exitCode = 1
}
