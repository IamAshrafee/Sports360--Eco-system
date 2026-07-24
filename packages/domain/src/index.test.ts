import { describe, expect, it } from "vitest"

import { createOpaqueId, parseOpaqueId } from "./index.js"

describe("opaque IDs", () => {
  it("creates sortable UUIDv7 identifiers", () => {
    const first = createOpaqueId()
    const second = createOpaqueId()

    expect(parseOpaqueId(first)).toBe(first)
    expect(first.localeCompare(second)).toBeLessThanOrEqual(0)
  })

  it("rejects malformed identifiers", () => {
    expect(() => parseOpaqueId("not-an-id")).toThrow(TypeError)
  })
})
