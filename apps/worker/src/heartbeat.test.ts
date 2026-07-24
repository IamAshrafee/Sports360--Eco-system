import { describe, expect, it } from "vitest"

import { createWorkerHeartbeat } from "./heartbeat.js"

describe("createWorkerHeartbeat", () => {
  it("creates a deterministic operational heartbeat", () => {
    expect(createWorkerHeartbeat(new Date("2026-07-24T00:00:00.000Z"))).toEqual(
      {
        emittedAt: "2026-07-24T00:00:00.000Z",
        service: "worker",
        status: "alive",
      },
    )
  })
})
