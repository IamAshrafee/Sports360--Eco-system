import { randomUUID } from "node:crypto"

import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { loggerOptions } from "@sports/observability"
import Fastify, {
  LogController,
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify"

import {
  registerAuthRoutes,
  type AuthRouteDependencies,
} from "./auth-routes.js"
import type { ApiConfig } from "./config.js"
import {
  createConfigurationRouteDependencies,
  registerConfigurationRoutes,
  type ConfigurationRouteDependencies,
} from "./configuration-routes.js"

export interface BuildAppOptions {
  config: ApiConfig
  auth?: AuthRouteDependencies
  configuration?: ConfigurationRouteDependencies
  logger?: FastifyServerOptions["logger"]
  readiness?: () => Promise<void>
}

export async function buildApp({
  auth,
  configuration,
  config,
  logger = loggerOptions({ level: config.LOG_LEVEL, service: "api" }),
  readiness,
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    genReqId: (request) => {
      const suppliedRequestId = request.headers["x-request-id"]

      return typeof suppliedRequestId === "string" &&
        suppliedRequestId.length <= 128
        ? suppliedRequestId
        : randomUUID()
    },
    logController: new LogController({
      disableRequestLogging: config.NODE_ENV === "test",
    }),
    logger,
    requestIdHeader: "x-request-id",
  })

  await app.register(helmet, {
    contentSecurityPolicy: false,
  })
  await app.register(cors, {
    credentials: true,
    origin: config.API_CORS_ORIGINS,
  })
  await app.register(swagger, {
    openapi: {
      info: {
        description:
          "Versioned API for sports venue business management clients and integrations.",
        title: "Sports Venue Management API",
        version: "0.1.0",
      },
      openapi: "3.1.0",
      servers: [{ url: config.BETTER_AUTH_BASE_URL }],
    },
  })
  await app.register(swaggerUi, {
    routePrefix: "/v1/docs",
    staticCSP: true,
  })

  if (auth !== undefined) {
    registerAuthRoutes(app, auth)
  }
  const configurationDependencies =
    configuration ??
    (auth === undefined
      ? undefined
      : createConfigurationRouteDependencies(auth.auth, auth.runtimePool))
  if (configurationDependencies !== undefined) {
    registerConfigurationRoutes(app, configurationDependencies)
  }

  app.get(
    "/v1/health/live",
    {
      schema: {
        description: "Process liveness check.",
        tags: ["health"],
        response: {
          200: {
            additionalProperties: false,
            properties: {
              requestId: { type: "string" },
              service: { const: "api", type: "string" },
              status: { const: "ok", type: "string" },
            },
            required: ["requestId", "service", "status"],
            type: "object",
          },
        },
      },
    },
    async (request) => ({
      requestId: request.id,
      service: "api" as const,
      status: "ok" as const,
    }),
  )

  app.get(
    "/v1/health/ready",
    {
      schema: {
        description: "Dependency readiness check.",
        tags: ["health"],
        response: {
          200: {
            additionalProperties: false,
            properties: {
              checks: {
                additionalProperties: false,
                properties: {
                  database: { const: "ok", type: "string" },
                  process: { const: "ok", type: "string" },
                },
                required: ["database", "process"],
                type: "object",
              },
              requestId: { type: "string" },
              service: { const: "api", type: "string" },
              status: { const: "ready", type: "string" },
            },
            required: ["checks", "requestId", "service", "status"],
            type: "object",
          },
          503: {
            additionalProperties: false,
            properties: {
              checks: {
                additionalProperties: false,
                properties: {
                  database: { const: "unavailable", type: "string" },
                  process: { const: "ok", type: "string" },
                },
                required: ["database", "process"],
                type: "object",
              },
              requestId: { type: "string" },
              service: { const: "api", type: "string" },
              status: { const: "unavailable", type: "string" },
            },
            required: ["checks", "requestId", "service", "status"],
            type: "object",
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await readiness?.()
        return {
          checks: {
            database: "ok" as const,
            process: "ok" as const,
          },
          requestId: request.id,
          service: "api" as const,
          status: "ready" as const,
        }
      } catch {
        return reply.status(503).send({
          checks: {
            database: "unavailable" as const,
            process: "ok" as const,
          },
          requestId: request.id,
          service: "api" as const,
          status: "unavailable" as const,
        })
      }
    },
  )

  return app
}
