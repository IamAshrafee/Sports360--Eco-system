import { describe, expect, it } from "vitest"

import * as apiClient from "./index.js"

describe("generated API client contract", () => {
  it("compiles independently of the web application", () => {
    expect(apiClient).toBeTypeOf("object")
  })
})
