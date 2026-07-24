import {
  createActivitySchema,
  createOfferingSchema,
  createResourceSchema,
  createScheduleVersionSchema,
  configurationListQuerySchema,
  scheduleListQuerySchema,
  slotPreviewQuerySchema,
  updateActivitySchema,
  updateOfferingSchema,
  updateResourceSchema,
} from "@sports/contracts"
import {
  ensureApplicationIdentity,
  fromNodeHeaders,
  type SportsAuth,
} from "@sports/auth"
import { AuthorizationError } from "@sports/authorization"
import { ConfigurationRuleError, ScheduleRuleError } from "@sports/domain"
import {
  ConfigurationPersistenceError,
  SchedulePersistenceError,
} from "@sports/persistence"
import type { FastifyInstance, FastifyRequest, FastifySchema } from "fastify"
import type { Pool } from "pg"
import { z, ZodError } from "zod"

import {
  createConfigurationService,
  type ConfigurationCommandContext,
  type ConfigurationService,
} from "./configuration-service.js"

interface AuthenticatedSubject {
  authSubjectId: string
  sessionVersion: number
}

export interface ConfigurationRouteDependencies {
  authenticate(
    headers: FastifyRequest["headers"],
  ): Promise<AuthenticatedSubject | null>
  service: ConfigurationService
}

class ConfigurationHttpError extends Error {
  override readonly name = "ConfigurationHttpError"

  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

const idSchema = { format: "uuid", type: "string" } as const
const timestampSchema = { format: "date-time", type: "string" } as const
const stateActivitySchema = {
  enum: ["ACTIVE", "INACTIVE"],
  type: "string",
} as const
const stateResourceSchema = {
  enum: ["DRAFT", "ACTIVE", "INACTIVE"],
  type: "string",
} as const

const activityResponseSchema = {
  additionalProperties: false,
  properties: {
    code: { type: "string" },
    createdAt: timestampSchema,
    displayName: { type: "string" },
    id: idSchema,
    state: stateActivitySchema,
    updatedAt: timestampSchema,
    version: { minimum: 1, type: "integer" },
  },
  required: [
    "code",
    "createdAt",
    "displayName",
    "id",
    "state",
    "updatedAt",
    "version",
  ],
  type: "object",
} as const

const resourceResponseSchema = {
  additionalProperties: false,
  properties: {
    activityId: idSchema,
    createdAt: timestampSchema,
    id: idSchema,
    name: { type: "string" },
    state: stateResourceSchema,
    updatedAt: timestampSchema,
    venueId: idSchema,
    version: { minimum: 1, type: "integer" },
  },
  required: [
    "activityId",
    "createdAt",
    "id",
    "name",
    "state",
    "updatedAt",
    "venueId",
    "version",
  ],
  type: "object",
} as const

const offeringResponseSchema = {
  additionalProperties: false,
  properties: {
    activityId: idSchema,
    createdAt: timestampSchema,
    durationMinutes: { maximum: 1440, minimum: 1, type: "integer" },
    id: idSchema,
    name: { type: "string" },
    resourceIds: { items: idSchema, minItems: 1, type: "array" },
    state: stateResourceSchema,
    updatedAt: timestampSchema,
    venueId: idSchema,
    version: { minimum: 1, type: "integer" },
  },
  required: [
    "activityId",
    "createdAt",
    "durationMinutes",
    "id",
    "name",
    "resourceIds",
    "state",
    "updatedAt",
    "venueId",
    "version",
  ],
  type: "object",
} as const

const errorResponseSchema = {
  additionalProperties: false,
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
  },
  required: ["code", "message", "requestId"],
  type: "object",
} as const

const headersSchema = {
  additionalProperties: true,
  properties: {
    "x-business-id": idSchema,
  },
  required: ["x-business-id"],
  type: "object",
} as const

const listQueryJsonSchema = {
  additionalProperties: false,
  properties: {
    cursor: idSchema,
    limit: { default: 50, maximum: 100, minimum: 1, type: "integer" },
  },
  type: "object",
} as const

const venueParamsSchema = {
  additionalProperties: false,
  properties: { venueId: idSchema },
  required: ["venueId"],
  type: "object",
} as const

const activityParamsSchema = {
  additionalProperties: false,
  properties: { activityId: idSchema },
  required: ["activityId"],
  type: "object",
} as const

const resourceParamsSchema = {
  additionalProperties: false,
  properties: { resourceId: idSchema, venueId: idSchema },
  required: ["resourceId", "venueId"],
  type: "object",
} as const

const offeringParamsSchema = {
  additionalProperties: false,
  properties: { offeringId: idSchema, venueId: idSchema },
  required: ["offeringId", "venueId"],
  type: "object",
} as const

function singleResponse(
  property: "activity" | "offering" | "resource",
  itemSchema: object,
) {
  return {
    additionalProperties: false,
    properties: {
      [property]: itemSchema,
      requestId: { type: "string" },
    },
    required: [property, "requestId"],
    type: "object",
  } as const
}

function listResponse(itemSchema: object) {
  return {
    additionalProperties: false,
    properties: {
      items: { items: itemSchema, type: "array" },
      nextCursor: { anyOf: [idSchema, { type: "null" }] },
      requestId: { type: "string" },
    },
    required: ["items", "nextCursor", "requestId"],
    type: "object",
  } as const
}

function responses(successSchema: object, successStatus = 200) {
  return {
    [successStatus]: successSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema,
    422: errorResponseSchema,
  }
}

const createActivityBodySchema = {
  additionalProperties: false,
  properties: {
    code: {
      maxLength: 80,
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      type: "string",
    },
    displayName: { maxLength: 120, minLength: 1, type: "string" },
    state: stateActivitySchema,
  },
  required: ["code", "displayName"],
  type: "object",
} as const

const updateActivityBodySchema = {
  additionalProperties: false,
  anyOf: [{ required: ["displayName"] }, { required: ["state"] }],
  properties: {
    displayName: { maxLength: 120, minLength: 1, type: "string" },
    expectedVersion: { minimum: 1, type: "integer" },
    state: stateActivitySchema,
  },
  required: ["expectedVersion"],
  type: "object",
} as const

const createResourceBodySchema = {
  additionalProperties: false,
  properties: {
    activityId: idSchema,
    name: { maxLength: 160, minLength: 1, type: "string" },
    state: stateResourceSchema,
  },
  required: ["activityId", "name"],
  type: "object",
} as const

const updateResourceBodySchema = {
  additionalProperties: false,
  anyOf: [
    { required: ["activityId"] },
    { required: ["name"] },
    { required: ["state"] },
  ],
  properties: {
    activityId: idSchema,
    expectedVersion: { minimum: 1, type: "integer" },
    name: { maxLength: 160, minLength: 1, type: "string" },
    state: stateResourceSchema,
  },
  required: ["expectedVersion"],
  type: "object",
} as const

const offeringBodyProperties = {
  activityId: idSchema,
  durationMinutes: { maximum: 1440, minimum: 1, type: "integer" },
  name: { maxLength: 160, minLength: 1, type: "string" },
  resourceIds: {
    items: idSchema,
    maxItems: 100,
    minItems: 1,
    type: "array",
    uniqueItems: true,
  },
  state: stateResourceSchema,
} as const

const createOfferingBodySchema = {
  additionalProperties: false,
  properties: offeringBodyProperties,
  required: ["activityId", "durationMinutes", "name", "resourceIds"],
  type: "object",
} as const

const updateOfferingBodySchema = {
  additionalProperties: false,
  anyOf: [
    { required: ["activityId"] },
    { required: ["durationMinutes"] },
    { required: ["name"] },
    { required: ["resourceIds"] },
    { required: ["state"] },
  ],
  properties: {
    ...offeringBodyProperties,
    expectedVersion: { minimum: 1, type: "integer" },
  },
  required: ["expectedVersion"],
  type: "object",
} as const

const localDateJsonSchema = { format: "date", type: "string" } as const
const localTimeJsonSchema = {
  pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
  type: "string",
} as const
const schedulePeriodResponseSchema = {
  additionalProperties: false,
  properties: {
    closesAt: localTimeJsonSchema,
    crossesMidnight: { type: "boolean" },
    opensAt: localTimeJsonSchema,
  },
  required: ["closesAt", "crossesMidnight", "opensAt"],
  type: "object",
} as const
const weeklySchedulePeriodResponseSchema = {
  ...schedulePeriodResponseSchema,
  properties: {
    ...schedulePeriodResponseSchema.properties,
    weekday: { maximum: 7, minimum: 1, type: "integer" },
  },
  required: [...schedulePeriodResponseSchema.required, "weekday"],
} as const
const scheduleExceptionResponseSchema = {
  additionalProperties: false,
  properties: {
    kind: { enum: ["CLOSED", "REPLACE"], type: "string" },
    localDate: localDateJsonSchema,
    periods: {
      items: schedulePeriodResponseSchema,
      type: "array",
    },
    reason: { maxLength: 240, minLength: 1, type: "string" },
  },
  required: ["kind", "localDate", "periods"],
  type: "object",
} as const
const scheduleVersionResponseSchema = {
  additionalProperties: false,
  properties: {
    createdAt: timestampSchema,
    effectiveFrom: localDateJsonSchema,
    effectiveUntil: {
      anyOf: [localDateJsonSchema, { type: "null" }],
    },
    exceptions: {
      items: scheduleExceptionResponseSchema,
      type: "array",
    },
    id: idSchema,
    resourceId: { anyOf: [idSchema, { type: "null" }] },
    scope: { enum: ["VENUE", "RESOURCE"], type: "string" },
    timezone: { maxLength: 120, minLength: 1, type: "string" },
    venueId: idSchema,
    version: { minimum: 1, type: "integer" },
    weeklyPeriods: {
      items: weeklySchedulePeriodResponseSchema,
      minItems: 1,
      type: "array",
    },
  },
  required: [
    "createdAt",
    "effectiveFrom",
    "effectiveUntil",
    "exceptions",
    "id",
    "resourceId",
    "scope",
    "timezone",
    "venueId",
    "version",
    "weeklyPeriods",
  ],
  type: "object",
} as const
const createScheduleVersionBodySchema = {
  additionalProperties: false,
  properties: {
    effectiveFrom: localDateJsonSchema,
    exceptions: {
      default: [],
      items: {
        ...scheduleExceptionResponseSchema,
        properties: {
          ...scheduleExceptionResponseSchema.properties,
          periods: {
            default: [],
            items: schedulePeriodResponseSchema,
            maxItems: 24,
            type: "array",
          },
        },
      },
      maxItems: 366,
      type: "array",
    },
    resourceId: idSchema,
    weeklyPeriods: {
      items: weeklySchedulePeriodResponseSchema,
      maxItems: 56,
      minItems: 1,
      type: "array",
    },
  },
  required: ["effectiveFrom", "weeklyPeriods"],
  type: "object",
} as const
const scheduleListQueryJsonSchema = {
  additionalProperties: false,
  properties: { resourceId: idSchema },
  type: "object",
} as const
const slotPreviewQueryJsonSchema = {
  additionalProperties: false,
  properties: {
    offeringId: idSchema,
    operationalDate: localDateJsonSchema,
    resourceId: idSchema,
  },
  required: ["offeringId", "operationalDate", "resourceId"],
  type: "object",
} as const
const generatedSlotResponseSchema = {
  additionalProperties: false,
  properties: {
    endAt: timestampSchema,
    localEnd: { type: "string" },
    localStart: { type: "string" },
    startAt: timestampSchema,
  },
  required: ["endAt", "localEnd", "localStart", "startAt"],
  type: "object",
} as const
const slotPreviewResponseSchema = {
  additionalProperties: false,
  properties: {
    offeringDurationMinutes: {
      maximum: 1440,
      minimum: 1,
      type: "integer",
    },
    operationalDate: localDateJsonSchema,
    scheduleScope: { enum: ["VENUE", "RESOURCE"], type: "string" },
    scheduleVersionId: idSchema,
    slots: { items: generatedSlotResponseSchema, type: "array" },
    timezone: { maxLength: 120, minLength: 1, type: "string" },
  },
  required: [
    "offeringDurationMinutes",
    "operationalDate",
    "scheduleScope",
    "scheduleVersionId",
    "slots",
    "timezone",
  ],
  type: "object",
} as const

const params = {
  activity: z.object({ activityId: z.uuid() }),
  offering: z.object({ offeringId: z.uuid(), venueId: z.uuid() }),
  resource: z.object({ resourceId: z.uuid(), venueId: z.uuid() }),
  venue: z.object({ venueId: z.uuid() }),
}

async function commandContext(
  request: FastifyRequest,
  dependencies: ConfigurationRouteDependencies,
): Promise<ConfigurationCommandContext> {
  const businessId = z.uuid().safeParse(request.headers["x-business-id"])
  if (!businessId.success) {
    throw new ConfigurationHttpError(
      400,
      "INVALID_BUSINESS_CONTEXT",
      "A valid business context is required.",
    )
  }

  const subject = await dependencies.authenticate(request.headers)
  if (subject === null) {
    throw new ConfigurationHttpError(
      401,
      "UNAUTHENTICATED",
      "A valid session is required.",
    )
  }

  return {
    ...subject,
    businessId: businessId.data,
    correlationId: request.id,
  }
}

function routeSchema(schema: FastifySchema): FastifySchema {
  return schema
}

function statusForPersistenceError(error: ConfigurationPersistenceError) {
  switch (error.code) {
    case "NOT_FOUND":
      return 404
    case "STALE_VERSION":
    case "DUPLICATE_CONFIGURATION":
      return 409
    case "INCOMPATIBLE_RELATIONSHIP":
      return 422
  }
}

function statusForSchedulePersistenceError(error: SchedulePersistenceError) {
  switch (error.code) {
    case "NOT_FOUND":
    case "NO_EFFECTIVE_SCHEDULE":
      return 404
    case "DUPLICATE_EFFECTIVE_DATE":
      return 409
    case "INCOMPATIBLE_RELATIONSHIP":
    case "INVALID_SCHEDULE":
      return 422
  }
}

function isPostgresError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  )
}

function isFastifyValidationError(
  error: unknown,
): error is { validation: unknown } {
  return typeof error === "object" && error !== null && "validation" in error
}

export function createConfigurationRouteDependencies(
  auth: SportsAuth,
  runtimePool: Pool,
): ConfigurationRouteDependencies {
  return {
    authenticate: async (headers) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
      })
      if (session === null) return null

      const identity = await ensureApplicationIdentity(
        runtimePool,
        session.user.id,
        session.user.name,
      )
      if (identity.state !== "ACTIVE") {
        throw new ConfigurationHttpError(
          403,
          "USER_INACTIVE",
          "This user cannot access the application.",
        )
      }

      return {
        authSubjectId: session.user.id,
        sessionVersion: identity.sessionVersion,
      }
    },
    service: createConfigurationService(runtimePool),
  }
}

export function registerConfigurationRoutes(
  app: FastifyInstance,
  dependencies: ConfigurationRouteDependencies,
): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ConfigurationHttpError) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
        requestId: request.id,
      })
    }
    if (error instanceof AuthorizationError) {
      return reply.status(403).send({
        code: "FORBIDDEN",
        message: "The requested action is not permitted.",
        requestId: request.id,
      })
    }
    if (error instanceof ConfigurationPersistenceError) {
      return reply.status(statusForPersistenceError(error)).send({
        code: error.code,
        message: error.message,
        requestId: request.id,
      })
    }
    if (error instanceof SchedulePersistenceError) {
      return reply.status(statusForSchedulePersistenceError(error)).send({
        code: error.code,
        message: error.message,
        requestId: request.id,
      })
    }
    if (
      error instanceof ConfigurationRuleError ||
      error instanceof ScheduleRuleError ||
      error instanceof ZodError
    ) {
      return reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "The configuration input is invalid.",
        requestId: request.id,
      })
    }
    if (isFastifyValidationError(error) && error.validation !== undefined) {
      return reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "The request does not match the API contract.",
        requestId: request.id,
      })
    }
    if (isPostgresError(error) && error.code === "42501") {
      return reply.status(404).send({
        code: "NOT_FOUND",
        message: "The requested configuration was not found.",
        requestId: request.id,
      })
    }
    if (isPostgresError(error) && error.code === "23505") {
      return reply.status(409).send({
        code: "DUPLICATE_CONFIGURATION",
        message: "An equivalent configuration already exists.",
        requestId: request.id,
      })
    }
    if (
      isPostgresError(error) &&
      (error.code === "23503" || error.code === "23514")
    ) {
      return reply.status(422).send({
        code: "INCOMPATIBLE_RELATIONSHIP",
        message: "The selected configuration is unavailable or incompatible.",
        requestId: request.id,
      })
    }
    if (isPostgresError(error) && error.code === "28000") {
      return reply.status(401).send({
        code: "SESSION_INVALID",
        message: "The session is invalid or has been revoked.",
        requestId: request.id,
      })
    }

    request.log.error({ err: error }, "configuration request failed")
    return reply.status(500).send({
      code: "INTERNAL_ERROR",
      message: "The request could not be completed.",
      requestId: request.id,
    })
  })

  app.get(
    "/v1/activities",
    {
      schema: routeSchema({
        description: "List tenant-owned activities using cursor pagination.",
        headers: headersSchema,
        operationId: "listActivities",
        querystring: listQueryJsonSchema,
        response: responses(listResponse(activityResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const query = configurationListQuerySchema.parse(request.query)
      const result = await dependencies.service.listActivities(context, query)
      return { ...result, requestId: request.id }
    },
  )

  app.post(
    "/v1/activities",
    {
      schema: routeSchema({
        body: createActivityBodySchema,
        description: "Create a tenant-owned activity.",
        headers: headersSchema,
        operationId: "createActivity",
        response: responses(
          singleResponse("activity", activityResponseSchema),
          201,
        ),
        tags: ["configuration"],
      }),
    },
    async (request, reply) => {
      const context = await commandContext(request, dependencies)
      const input = createActivitySchema.parse(request.body)
      const activity = await dependencies.service.createActivity(context, input)
      return reply.status(201).send({ activity, requestId: request.id })
    },
  )

  app.patch(
    "/v1/activities/:activityId",
    {
      schema: routeSchema({
        body: updateActivityBodySchema,
        description: "Edit an activity using optimistic concurrency.",
        headers: headersSchema,
        operationId: "updateActivity",
        params: activityParamsSchema,
        response: responses(singleResponse("activity", activityResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { activityId } = params.activity.parse(request.params)
      const input = updateActivitySchema.parse(request.body)
      const activity = await dependencies.service.updateActivity(
        context,
        activityId,
        input,
      )
      return { activity, requestId: request.id }
    },
  )

  app.get(
    "/v1/venues/:venueId/resources",
    {
      schema: routeSchema({
        description: "List independent resources for an authorized venue.",
        headers: headersSchema,
        operationId: "listResources",
        params: venueParamsSchema,
        querystring: listQueryJsonSchema,
        response: responses(listResponse(resourceResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const query = configurationListQuerySchema.parse(request.query)
      const result = await dependencies.service.listResources(
        context,
        venueId,
        query,
      )
      return { ...result, requestId: request.id }
    },
  )

  app.post(
    "/v1/venues/:venueId/resources",
    {
      schema: routeSchema({
        body: createResourceBodySchema,
        description: "Create one independent allocatable resource.",
        headers: headersSchema,
        operationId: "createResource",
        params: venueParamsSchema,
        response: responses(
          singleResponse("resource", resourceResponseSchema),
          201,
        ),
        tags: ["configuration"],
      }),
    },
    async (request, reply) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const input = createResourceSchema.parse(request.body)
      const resource = await dependencies.service.createResource(
        context,
        venueId,
        input,
      )
      return reply.status(201).send({ requestId: request.id, resource })
    },
  )

  app.patch(
    "/v1/venues/:venueId/resources/:resourceId",
    {
      schema: routeSchema({
        body: updateResourceBodySchema,
        description: "Edit a resource using optimistic concurrency.",
        headers: headersSchema,
        operationId: "updateResource",
        params: resourceParamsSchema,
        response: responses(singleResponse("resource", resourceResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { resourceId, venueId } = params.resource.parse(request.params)
      const input = updateResourceSchema.parse(request.body)
      const resource = await dependencies.service.updateResource(
        context,
        venueId,
        resourceId,
        input,
      )
      return { requestId: request.id, resource }
    },
  )

  app.get(
    "/v1/venues/:venueId/offerings",
    {
      schema: routeSchema({
        description: "List offerings and compatible resources for a venue.",
        headers: headersSchema,
        operationId: "listOfferings",
        params: venueParamsSchema,
        querystring: listQueryJsonSchema,
        response: responses(listResponse(offeringResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const query = configurationListQuerySchema.parse(request.query)
      const result = await dependencies.service.listOfferings(
        context,
        venueId,
        query,
      )
      return { ...result, requestId: request.id }
    },
  )

  app.post(
    "/v1/venues/:venueId/offerings",
    {
      schema: routeSchema({
        body: createOfferingBodySchema,
        description:
          "Create an offering with fixed duration and compatible resources.",
        headers: headersSchema,
        operationId: "createOffering",
        params: venueParamsSchema,
        response: responses(
          singleResponse("offering", offeringResponseSchema),
          201,
        ),
        tags: ["configuration"],
      }),
    },
    async (request, reply) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const input = createOfferingSchema.parse(request.body)
      const offering = await dependencies.service.createOffering(
        context,
        venueId,
        input,
      )
      return reply.status(201).send({ offering, requestId: request.id })
    },
  )

  app.get(
    "/v1/venues/:venueId/offerings/:offeringId",
    {
      schema: routeSchema({
        description: "Get one non-enumerating offering detail.",
        headers: headersSchema,
        operationId: "getOffering",
        params: offeringParamsSchema,
        response: responses(singleResponse("offering", offeringResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { offeringId, venueId } = params.offering.parse(request.params)
      const offering = await dependencies.service.getOffering(
        context,
        venueId,
        offeringId,
      )
      return { offering, requestId: request.id }
    },
  )

  app.patch(
    "/v1/venues/:venueId/offerings/:offeringId",
    {
      schema: routeSchema({
        body: updateOfferingBodySchema,
        description: "Edit an offering using optimistic concurrency.",
        headers: headersSchema,
        operationId: "updateOffering",
        params: offeringParamsSchema,
        response: responses(singleResponse("offering", offeringResponseSchema)),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { offeringId, venueId } = params.offering.parse(request.params)
      const input = updateOfferingSchema.parse(request.body)
      const offering = await dependencies.service.updateOffering(
        context,
        venueId,
        offeringId,
        input,
      )
      return { offering, requestId: request.id }
    },
  )

  app.get(
    "/v1/venues/:venueId/schedules",
    {
      schema: routeSchema({
        description:
          "List immutable venue and resource schedule versions for an authorized venue.",
        headers: headersSchema,
        operationId: "listScheduleVersions",
        params: venueParamsSchema,
        querystring: scheduleListQueryJsonSchema,
        response: responses({
          additionalProperties: false,
          properties: {
            items: { items: scheduleVersionResponseSchema, type: "array" },
            requestId: { type: "string" },
          },
          required: ["items", "requestId"],
          type: "object",
        }),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const query = scheduleListQuerySchema.parse(request.query)
      const items = await dependencies.service.listScheduleVersions(
        context,
        venueId,
        query,
      )
      return { items, requestId: request.id }
    },
  )

  app.post(
    "/v1/venues/:venueId/schedules",
    {
      schema: routeSchema({
        body: createScheduleVersionBodySchema,
        description:
          "Create an immutable effective-dated venue or resource schedule version.",
        headers: headersSchema,
        operationId: "createScheduleVersion",
        params: venueParamsSchema,
        response: responses(
          {
            additionalProperties: false,
            properties: {
              requestId: { type: "string" },
              schedule: scheduleVersionResponseSchema,
            },
            required: ["requestId", "schedule"],
            type: "object",
          },
          201,
        ),
        tags: ["configuration"],
      }),
    },
    async (request, reply) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const input = createScheduleVersionSchema.parse(request.body)
      const schedule = await dependencies.service.createScheduleVersion(
        context,
        venueId,
        input,
      )
      return reply.status(201).send({ requestId: request.id, schedule })
    },
  )

  app.get(
    "/v1/venues/:venueId/slot-preview",
    {
      schema: routeSchema({
        description:
          "Preview generated fixed schedule slots; this is not live availability.",
        headers: headersSchema,
        operationId: "previewFixedSlots",
        params: venueParamsSchema,
        querystring: slotPreviewQueryJsonSchema,
        response: responses({
          additionalProperties: false,
          properties: {
            preview: slotPreviewResponseSchema,
            requestId: { type: "string" },
          },
          required: ["preview", "requestId"],
          type: "object",
        }),
        tags: ["configuration"],
      }),
    },
    async (request) => {
      const context = await commandContext(request, dependencies)
      const { venueId } = params.venue.parse(request.params)
      const query = slotPreviewQuerySchema.parse(request.query)
      const preview = await dependencies.service.previewFixedSlots(
        context,
        venueId,
        query,
      )
      return { preview, requestId: request.id }
    },
  )
}
