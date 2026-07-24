import { describe, expect, it } from "vitest"

import {
  assertOfferingDuration,
  ConfigurationRuleError,
  normalizeActivityCode,
  uniqueResourceIds,
} from "./configuration.js"

describe("configuration rules", () => {
  it("accepts bounded whole-minute durations", () => {
    expect(() => assertOfferingDuration(60)).not.toThrow()
    expect(() => assertOfferingDuration(1440)).not.toThrow()
  })

  it.each([0, -1, 1.5, 1441])("rejects invalid duration %s", (duration) => {
    expect(() => assertOfferingDuration(duration)).toThrow(
      ConfigurationRuleError,
    )
  })

  it("creates a stable tenant-owned activity code", () => {
    expect(normalizeActivityCode("  Table Tennis  ")).toBe("table-tennis")
  })

  it("requires compatible resources and removes duplicates", () => {
    expect(uniqueResourceIds(["a", "a", "b"])).toEqual(["a", "b"])
    expect(() => uniqueResourceIds([])).toThrow(ConfigurationRuleError)
  })
})
