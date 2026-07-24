import {
  ensureApplicationIdentity,
  fromNodeHeaders,
  type SportsAuth,
} from "@sports/auth"
import type { FastifyInstance } from "fastify"
import type { Pool } from "pg"

export interface AuthRouteDependencies {
  auth: SportsAuth
  runtimePool: Pool
}

export function registerAuthRoutes(
  app: FastifyInstance,
  { auth, runtimePool }: AuthRouteDependencies,
): void {
  app.route({
    handler: async (request, reply) => {
      const url = new URL(
        request.url,
        `${request.protocol}://${request.headers.host ?? "localhost"}`,
      )
      const response = await auth.handler(
        new Request(url, {
          headers: fromNodeHeaders(request.headers),
          method: request.method,
          ...(request.body === undefined
            ? {}
            : { body: JSON.stringify(request.body) }),
        }),
      )

      reply.status(response.status)
      response.headers.forEach((value, name) => {
        reply.header(name, value)
      })

      return reply.send(response.body ? await response.text() : null)
    },
    method: ["GET", "POST"],
    schema: { hide: true },
    url: "/v1/auth/*",
  })

  app.get(
    "/v1/me",
    {
      schema: {
        description: "Return the authenticated application identity.",
        response: {
          200: {
            additionalProperties: false,
            properties: {
              requestId: { type: "string" },
              user: {
                additionalProperties: false,
                properties: {
                  displayName: { type: "string" },
                  id: { format: "uuid", type: "string" },
                  phoneNumber: { type: "string" },
                },
                required: ["displayName", "id", "phoneNumber"],
                type: "object",
              },
            },
            required: ["requestId", "user"],
            type: "object",
          },
          401: {
            additionalProperties: false,
            properties: {
              code: { const: "UNAUTHENTICATED", type: "string" },
              message: { type: "string" },
              requestId: { type: "string" },
            },
            required: ["code", "message", "requestId"],
            type: "object",
          },
          403: {
            additionalProperties: false,
            properties: {
              code: { const: "USER_INACTIVE", type: "string" },
              message: { type: "string" },
              requestId: { type: "string" },
            },
            required: ["code", "message", "requestId"],
            type: "object",
          },
        },
        tags: ["identity"],
      },
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (session === null) {
        return reply.status(401).send({
          code: "UNAUTHENTICATED",
          message: "A valid session is required.",
          requestId: request.id,
        })
      }

      const identity = await ensureApplicationIdentity(
        runtimePool,
        session.user.id,
        session.user.name,
      )

      if (identity.state !== "ACTIVE") {
        return reply.status(403).send({
          code: "USER_INACTIVE",
          message: "This user cannot access the application.",
          requestId: request.id,
        })
      }

      return {
        requestId: request.id,
        user: {
          displayName: session.user.name,
          id: identity.userId,
          phoneNumber: session.user.phoneNumber,
        },
      }
    },
  )
}
