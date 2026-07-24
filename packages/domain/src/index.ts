import { v7 as uuidv7, validate as validateUuid } from "uuid"

declare const opaqueIdBrand: unique symbol

export type OpaqueId = string & { readonly [opaqueIdBrand]: true }

export function createOpaqueId(): OpaqueId {
  return uuidv7() as OpaqueId
}

export function parseOpaqueId(value: string): OpaqueId {
  if (!validateUuid(value)) {
    throw new TypeError("Expected an opaque UUID")
  }

  return value as OpaqueId
}

export {
  assertOfferingDuration,
  ConfigurationRuleError,
  MAX_OFFERING_DURATION_MINUTES,
  MIN_OFFERING_DURATION_MINUTES,
  normalizeActivityCode,
  uniqueResourceIds,
} from "./configuration.js"
export {
  assertIanaTimezone,
  assertScheduleDefinition,
  effectivePeriodsForDate,
  generateFixedSlots,
  isoWeekday,
  ScheduleRuleError,
  type FixedSlot,
  type LocalScheduleException,
  type LocalSchedulePeriod,
  type WeeklyLocalSchedulePeriod,
} from "./schedule.js"
