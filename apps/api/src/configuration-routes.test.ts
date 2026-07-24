import { AuthorizationError } from "@sports/authorization"
import { ConfigurationPersistenceError } from "@sports/persistence"
import { afterEach, describe, expect, it, vi } from "vitest"

import { buildApp } from "./app.js"
import type { ApiConfig } from "./config.js"
import type { ConfigurationRouteDependencies } from "./configuration-routes.js"

const businessId = "019b7000-0000-7000-8000-000000000001"
const venueId = "019b7000-0000-7000-8000-000000000201"
const activityId = "019b7000-0000-7000-8000-000000000401"

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

const activity = {
  code: "football",
  createdAt: "2026-07-24T10:00:00.000Z",
  displayName: "Football",
  id: activityId,
  state: "ACTIVE" as const,
  updatedAt: "2026-07-24T10:00:00.000Z",
  version: 1,
}

function dependencies(): ConfigurationRouteDependencies {
  return {
    authenticate: vi.fn().mockResolvedValue({
      authSubjectId: "auth-subject",
      sessionVersion: 0,
    }),
    service: {
      createActivity: vi.fn().mockResolvedValue(activity),
      createOffering: vi.fn(),
      createResource: vi.fn(),
      getOffering: vi.fn(),
      listActivities: vi.fn().mockResolvedValue({
        items: [activity],
        nextCursor: null,
      }),
      listOfferings: vi.fn().mockResolvedValue({
        items: [],
        nextCursor: null,
      }),
      listResources: vi.fn().mockResolvedValue({
        items: [],
        nextCursor: null,
      }),
      updateActivity: vi.fn(),
      updateOffering: vi.fn(),
      updateResource: vi.fn(),
    },
  }
}

const apps: Awaited<ReturnType<typeof buildApp>>[] = []

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()))
})

describe("configuration API", () => {
  it("lists tenant activities with a correlated response", async () => {
    const configuration = dependencies()
    const app = await buildApp({
      config: testConfig,
      configuration,
      logger: false,
    })
    apps.push(app)

    const response = await app.inject({
      headers: {
        "x-business-id": businessId,
        "x-request-id": "configuration-list",
      },
      method: "GET",
      url: "/v1/activities",
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      items: [activity],
      nextCursor: null,
      requestId: "configuration-list",
    })
    expect(configuration.service.listActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId,
        correlationId: "configuration-list",
      }),
      { limit: 50 },
    )
  })

  it("creates a validated activity and returns the persisted result", async () => {
    const configuration = dependencies()
    const app = await buildApp({
      config: testConfig,
      configuration,
      logger: false,
    })
    apps.push(app)

    const response = await app.inject({
      headers: { "x-business-id": businessId },
      method: "POST",
      payload: {
        code: "football",
        displayName: "Football",
      },
      url: "/v1/activities",
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ activity })
    expect(configuration.service.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({ businessId }),
      {
        code: "football",
        displayName: "Football",
        state: "ACTIVE",
      },
    )
  })

  it("uses stable safe errors for invalid context and denied mutations", async () => {
    const configuration = dependencies()
    vi.mocked(configuration.service.createResource).mockRejectedValue(
      new AuthorizationError(),
    )
    const app = await buildApp({
      config: testConfig,
      configuration,
      logger: false,
    })
    apps.push(app)

    const invalidContext = await app.inject({
      method: "GET",
      url: "/v1/activities",
    })
    expect(invalidContext.statusCode).toBe(400)
    expect(invalidContext.json()).toMatchObject({
      code: "VALIDATION_ERROR",
    })

    const denied = await app.inject({
      headers: { "x-business-id": businessId },
      method: "POST",
      payload: {
        activityId,
        name: "Turf 2",
      },
      url: `/v1/venues/${venueId}/resources`,
    })
    expect(denied.statusCode).toBe(403)
    expect(denied.json()).toMatchObject({
      code: "FORBIDDEN",
      message: "The requested action is not permitted.",
    })
  })

  it("maps stale edits and foreign identifiers without leaking details", async () => {
    const configuration = dependencies()
    vi.mocked(configuration.service.updateActivity).mockRejectedValue(
      new ConfigurationPersistenceError(
        "STALE_VERSION",
        "This activity changed after it was loaded.",
      ),
    )
    vi.mocked(configuration.service.getOffering).mockRejectedValue(
      new ConfigurationPersistenceError(
        "NOT_FOUND",
        "The requested configuration was not found.",
      ),
    )
    const app = await buildApp({
      config: testConfig,
      configuration,
      logger: false,
    })
    apps.push(app)

    const stale = await app.inject({
      headers: { "x-business-id": businessId },
      method: "PATCH",
      payload: { displayName: "Futsal", expectedVersion: 1 },
      url: `/v1/activities/${activityId}`,
    })
    expect(stale.statusCode).toBe(409)
    expect(stale.json()).toMatchObject({ code: "STALE_VERSION" })

    const missing = await app.inject({
      headers: { "x-business-id": businessId },
      method: "GET",
      url: `/v1/venues/${venueId}/offerings/019b7000-0000-7000-8000-000000000999`,
    })
    expect(missing.statusCode).toBe(404)
    expect(missing.json()).toEqual({
      code: "NOT_FOUND",
      message: "The requested configuration was not found.",
      requestId: missing.json().requestId,
    })
  })

  it("publishes all configuration operations in OpenAPI", async () => {
    const app = await buildApp({
      config: testConfig,
      configuration: dependencies(),
      logger: false,
    })
    apps.push(app)
    await app.ready()

    expect(app.swagger().paths).toMatchObject({
      "/v1/activities": {
        get: { operationId: "listActivities" },
        post: { operationId: "createActivity" },
      },
      "/v1/venues/{venueId}/offerings/{offeringId}": {
        get: { operationId: "getOffering" },
        patch: { operationId: "updateOffering" },
      },
      "/v1/venues/{venueId}/resources": {
        get: { operationId: "listResources" },
        post: { operationId: "createResource" },
      },
    })
  })
})
