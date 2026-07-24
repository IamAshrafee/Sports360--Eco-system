import { z } from "zod"

export const profileCodes = [
  "OWNER",
  "MANAGER",
  "BOOKING_STAFF",
  "FINANCE_REPORTS",
] as const

export const permissionCodes = [
  "booking.read",
  "booking.create",
  "booking.change",
  "booking.cancel",
  "attendance.change",
  "payment.read",
  "payment.collect",
  "payment.verify",
  "payment.reverse",
  "payment.refund",
  "customer.read",
  "customer.create",
  "customer.change",
  "customer.restrict",
  "customer.merge",
  "customer.export",
  "resource.read",
  "resource.configure",
  "resource.block",
  "staff.read",
  "staff.invite",
  "staff.change",
  "staff.remove",
  "report.operational",
  "report.financial",
  "report.export",
  "report.audit",
  "settings.venue",
  "settings.business",
  "subscription.read",
  "subscription.manage",
] as const

export const platformPermissionCodes = [
  "platform.tenant_admin",
  "platform.entitlement",
  "platform.audit",
] as const

export const profileCodeSchema = z.enum(profileCodes)
export const permissionCodeSchema = z.enum(permissionCodes)
export const platformPermissionCodeSchema = z.enum(platformPermissionCodes)
export const opaqueIdSchema = z.uuid()

export const actorContextSchema = z.object({
  accessVersion: z.number().int().nonnegative(),
  allowedVenueIds: z.array(opaqueIdSchema),
  businessId: opaqueIdSchema,
  businessWide: z.boolean(),
  correlationId: z.string().min(1).max(128),
  membershipId: opaqueIdSchema,
  permissions: z.array(permissionCodeSchema),
  profileCode: profileCodeSchema,
  sessionVersion: z.number().int().nonnegative(),
  userId: opaqueIdSchema,
})

export type ActorContext = z.infer<typeof actorContextSchema>
export type PermissionCode = z.infer<typeof permissionCodeSchema>
export type PlatformPermissionCode = z.infer<
  typeof platformPermissionCodeSchema
>
export type ProfileCode = z.infer<typeof profileCodeSchema>

export {
  activityCodeSchema,
  activitySchema,
  activityStateSchema,
  configurationListQuerySchema,
  createActivitySchema,
  createOfferingSchema,
  createResourceSchema,
  offeringSchema,
  offeringStateSchema,
  resourceSchema,
  resourceStateSchema,
  updateActivitySchema,
  updateOfferingSchema,
  updateResourceSchema,
  type Activity,
  type ActivityState,
  type ConfigurationListQuery,
  type CreateActivity,
  type CreateOffering,
  type CreateResource,
  type Offering,
  type OfferingState,
  type Resource,
  type ResourceState,
  type UpdateActivity,
  type UpdateOffering,
  type UpdateResource,
} from "./configuration.js"
export {
  createScheduleVersionSchema,
  generatedSlotSchema,
  scheduleExceptionKindSchema,
  scheduleExceptionSchema,
  scheduleListQuerySchema,
  schedulePeriodSchema,
  scheduleScopeSchema,
  scheduleVersionSchema,
  slotPreviewQuerySchema,
  slotPreviewSchema,
  weeklySchedulePeriodSchema,
  type CreateScheduleVersion,
  type GeneratedSlot,
  type ScheduleException,
  type ScheduleExceptionKind,
  type ScheduleListQuery,
  type SchedulePeriod,
  type ScheduleScope,
  type ScheduleVersion,
  type SlotPreview,
  type SlotPreviewQuery,
  type WeeklySchedulePeriod,
} from "./schedule.js"
