export const MIN_OFFERING_DURATION_MINUTES = 1
export const MAX_OFFERING_DURATION_MINUTES = 24 * 60

export class ConfigurationRuleError extends Error {
  readonly code = "CONFIGURATION_RULE_VIOLATION"
  override readonly name = "ConfigurationRuleError"

  constructor(message: string) {
    super(message)
  }
}

export function assertOfferingDuration(durationMinutes: number): void {
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < MIN_OFFERING_DURATION_MINUTES ||
    durationMinutes > MAX_OFFERING_DURATION_MINUTES
  ) {
    throw new ConfigurationRuleError(
      `Duration must be a whole number from ${MIN_OFFERING_DURATION_MINUTES} to ${MAX_OFFERING_DURATION_MINUTES} minutes.`,
    )
  }
}

export function normalizeActivityCode(value: string): string {
  const code = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (code.length === 0 || code.length > 80) {
    throw new ConfigurationRuleError(
      "Activity code must contain letters or numbers and be at most 80 characters.",
    )
  }

  return code
}

export function uniqueResourceIds(resourceIds: readonly string[]): string[] {
  const unique = [...new Set(resourceIds)]

  if (unique.length === 0) {
    throw new ConfigurationRuleError(
      "An offering requires at least one compatible resource.",
    )
  }

  return unique
}
