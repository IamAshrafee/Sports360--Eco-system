import { afterEach, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"
import type { ApiConfig } from "./config.js"

const testConfig: ApiConfig = {
  API_CORS_ORIGINS: ["http://localhost:3000"],
  API_HOST: "127.0.0.1",
  API_PORT: 4000,
  BETTER_AUTH_BASE_URL: "http://localhost:4000",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
  DATABASE_AUTH_URL: "postgresql://auth:test@localhost:5432/test",
  DATABASE_RUNTIME_URL: "postgresql://runtime:test@localhost:5432/test",
  LOG_LEVEL: "silent",
  NODE_ENV: "test",
  OTEL_EXPORTER_OTLP_ENDPOINT: undefined,
}

const apps: Awaited<ReturnType<typeof buildApp>>[] = []

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()))
})

describe("API health", () => {
  it("returns a correlated liveness response", async () => {
    const app = await buildApp({ config: testConfig, logger: false })
    apps.push(app)

    const response = await app.inject({
      headers: {
        "x-request-id": "test-request-id",
      },
      method: "GET",
      url: "/v1/health/live",
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      requestId: "test-request-id",
      service: "api",
      status: "ok",
    })
    expect(response.headers["x-content-type-options"]).toBe("nosniff")
    expect(app.swagger()).toMatchObject({
      info: {
        title: "Sports Venue Management API",
        version: "0.1.0",
      },
      openapi: "3.1.0",
      paths: {
        "/v1/health/live": {
          get: {
            tags: ["health"],
          },
        },
      },
    })
  })

  it("reports dependency failure through readiness", async () => {
    const app = await buildApp({
      config: testConfig,
      logger: false,
      readiness: async () => {
        throw new Error("database unavailable")
      },
    })
    apps.push(app)

    const response = await app.inject({
      method: "GET",
      url: "/v1/health/ready",
    })

    expect(response.statusCode).toBe(503)
    expect(response.json()).toMatchObject({
      checks: {
        database: "unavailable",
        process: "ok",
      },
      service: "api",
      status: "unavailable",
    })
  })
})
