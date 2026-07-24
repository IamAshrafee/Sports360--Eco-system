import { describe, expect, it } from "vitest"

import { permissionCodeSchema, profileCodeSchema } from "./index.js"

describe("access contracts", () => {
  it("rejects invented roles and permissions", () => {
    expect(profileCodeSchema.safeParse("SUPER_ADMIN").success).toBe(false)
    expect(permissionCodeSchema.safeParse("everything.allow").success).toBe(
      false,
    )
  })
})
