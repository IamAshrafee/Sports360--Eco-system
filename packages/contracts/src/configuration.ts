import { z } from "zod"

const opaqueIdSchema = z.uuid()

export const activityStateSchema = z.enum(["ACTIVE", "INACTIVE"])
export const resourceStateSchema = z.enum(["DRAFT", "ACTIVE", "INACTIVE"])
export const offeringStateSchema = z.enum(["DRAFT", "ACTIVE", "INACTIVE"])

export const activityCodeSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const displayNameSchema = z.string().trim().min(1).max(160)
const expectedVersionSchema = z.number().int().positive()

export const activitySchema = z.object({
  code: activityCodeSchema,
  createdAt: z.iso.datetime(),
  displayName: z.string(),
  id: opaqueIdSchema,
  state: activityStateSchema,
  updatedAt: z.iso.datetime(),
  version: expectedVersionSchema,
})

export const createActivitySchema = z.object({
  code: activityCodeSchema,
  displayName: displayNameSchema.max(120),
  state: activityStateSchema.default("ACTIVE"),
})

export const updateActivitySchema = z
  .object({
    displayName: displayNameSchema.max(120).optional(),
    expectedVersion: expectedVersionSchema,
    state: activityStateSchema.optional(),
  })
  .refine(
    ({ displayName, state }) =>
      displayName !== undefined || state !== undefined,
    "At least one activity field must change.",
  )

export const resourceSchema = z.object({
  activityId: opaqueIdSchema,
  createdAt: z.iso.datetime(),
  id: opaqueIdSchema,
  name: z.string(),
  state: resourceStateSchema,
  updatedAt: z.iso.datetime(),
  venueId: opaqueIdSchema,
  version: expectedVersionSchema,
})

export const createResourceSchema = z.object({
  activityId: opaqueIdSchema,
  name: displayNameSchema,
  state: resourceStateSchema.default("ACTIVE"),
})

export const updateResourceSchema = z
  .object({
    activityId: opaqueIdSchema.optional(),
    expectedVersion: expectedVersionSchema,
    name: displayNameSchema.optional(),
    state: resourceStateSchema.optional(),
  })
  .refine(
    ({ activityId, name, state }) =>
      activityId !== undefined || name !== undefined || state !== undefined,
    "At least one resource field must change.",
  )

export const offeringSchema = z.object({
  activityId: opaqueIdSchema,
  createdAt: z.iso.datetime(),
  durationMinutes: z.number().int().min(1).max(1440),
  id: opaqueIdSchema,
  name: z.string(),
  resourceIds: z.array(opaqueIdSchema).min(1),
  state: offeringStateSchema,
  updatedAt: z.iso.datetime(),
  venueId: opaqueIdSchema,
  version: expectedVersionSchema,
})

export const createOfferingSchema = z.object({
  activityId: opaqueIdSchema,
  durationMinutes: z.number().int().min(1).max(1440),
  name: displayNameSchema,
  resourceIds: z.array(opaqueIdSchema).min(1).max(100),
  state: offeringStateSchema.default("DRAFT"),
})

export const updateOfferingSchema = z
  .object({
    activityId: opaqueIdSchema.optional(),
    durationMinutes: z.number().int().min(1).max(1440).optional(),
    expectedVersion: expectedVersionSchema,
    name: displayNameSchema.optional(),
    resourceIds: z.array(opaqueIdSchema).min(1).max(100).optional(),
    state: offeringStateSchema.optional(),
  })
  .refine(
    ({ activityId, durationMinutes, name, resourceIds, state }) =>
      activityId !== undefined ||
      durationMinutes !== undefined ||
      name !== undefined ||
      resourceIds !== undefined ||
      state !== undefined,
    "At least one offering field must change.",
  )

export const configurationListQuerySchema = z.object({
  cursor: opaqueIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export type Activity = z.infer<typeof activitySchema>
export type ActivityState = z.infer<typeof activityStateSchema>
export type ConfigurationListQuery = z.infer<
  typeof configurationListQuerySchema
>
export type CreateActivity = z.infer<typeof createActivitySchema>
export type CreateOffering = z.infer<typeof createOfferingSchema>
export type CreateResource = z.infer<typeof createResourceSchema>
export type Offering = z.infer<typeof offeringSchema>
export type OfferingState = z.infer<typeof offeringStateSchema>
export type Resource = z.infer<typeof resourceSchema>
export type ResourceState = z.infer<typeof resourceStateSchema>
export type UpdateActivity = z.infer<typeof updateActivitySchema>
export type UpdateOffering = z.infer<typeof updateOfferingSchema>
export type UpdateResource = z.infer<typeof updateResourceSchema>
