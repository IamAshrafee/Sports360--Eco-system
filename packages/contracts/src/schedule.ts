import { z } from "zod"

const opaqueIdSchema = z.uuid()
const localDateSchema = z.iso.date()
const localTimeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)

export const scheduleScopeSchema = z.enum(["VENUE", "RESOURCE"])
export const scheduleExceptionKindSchema = z.enum(["CLOSED", "REPLACE"])

export const schedulePeriodSchema = z.object({
  closesAt: localTimeSchema,
  crossesMidnight: z.boolean().default(false),
  opensAt: localTimeSchema,
})

export const weeklySchedulePeriodSchema = schedulePeriodSchema.extend({
  weekday: z.number().int().min(1).max(7),
})

export const scheduleExceptionSchema = z
  .object({
    kind: scheduleExceptionKindSchema,
    localDate: localDateSchema,
    periods: z.array(schedulePeriodSchema).max(24).default([]),
    reason: z.string().trim().min(1).max(240).optional(),
  })
  .superRefine(({ kind, periods }, context) => {
    if (kind === "CLOSED" && periods.length !== 0) {
      context.addIssue({
        code: "custom",
        message: "A closed exception cannot contain periods.",
        path: ["periods"],
      })
    }
    if (kind === "REPLACE" && periods.length === 0) {
      context.addIssue({
        code: "custom",
        message: "A replacement exception requires at least one period.",
        path: ["periods"],
      })
    }
  })

export const createScheduleVersionSchema = z.object({
  effectiveFrom: localDateSchema,
  exceptions: z.array(scheduleExceptionSchema).max(366).default([]),
  resourceId: opaqueIdSchema.optional(),
  weeklyPeriods: z.array(weeklySchedulePeriodSchema).min(1).max(56),
})

export const scheduleVersionSchema = z.object({
  createdAt: z.iso.datetime(),
  effectiveFrom: localDateSchema,
  effectiveUntil: localDateSchema.nullable(),
  exceptions: z.array(scheduleExceptionSchema),
  id: opaqueIdSchema,
  resourceId: opaqueIdSchema.nullable(),
  scope: scheduleScopeSchema,
  timezone: z.string().min(1).max(120),
  venueId: opaqueIdSchema,
  version: z.number().int().positive(),
  weeklyPeriods: z.array(weeklySchedulePeriodSchema),
})

export const scheduleListQuerySchema = z.object({
  resourceId: opaqueIdSchema.optional(),
})

export const slotPreviewQuerySchema = z.object({
  offeringId: opaqueIdSchema,
  operationalDate: localDateSchema,
  resourceId: opaqueIdSchema,
})

export const generatedSlotSchema = z.object({
  endAt: z.iso.datetime(),
  localEnd: z.string(),
  localStart: z.string(),
  startAt: z.iso.datetime(),
})

export const slotPreviewSchema = z.object({
  offeringDurationMinutes: z.number().int().min(1).max(1440),
  operationalDate: localDateSchema,
  scheduleScope: scheduleScopeSchema,
  scheduleVersionId: opaqueIdSchema,
  slots: z.array(generatedSlotSchema),
  timezone: z.string().min(1).max(120),
})

export type CreateScheduleVersion = z.infer<typeof createScheduleVersionSchema>
export type GeneratedSlot = z.infer<typeof generatedSlotSchema>
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>
export type ScheduleExceptionKind = z.infer<typeof scheduleExceptionKindSchema>
export type ScheduleListQuery = z.infer<typeof scheduleListQuerySchema>
export type SchedulePeriod = z.infer<typeof schedulePeriodSchema>
export type ScheduleScope = z.infer<typeof scheduleScopeSchema>
export type ScheduleVersion = z.infer<typeof scheduleVersionSchema>
export type SlotPreview = z.infer<typeof slotPreviewSchema>
export type SlotPreviewQuery = z.infer<typeof slotPreviewQuerySchema>
export type WeeklySchedulePeriod = z.infer<typeof weeklySchedulePeriodSchema>
