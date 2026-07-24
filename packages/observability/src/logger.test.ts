import { Writable } from "node:stream"

import { describe, expect, it } from "vitest"

import { createLogger } from "./logger.js"

describe("structured log safeguards", () => {
  it("removes authentication, OTP, phone, and cookie values", () => {
    let output = ""
    const destination = new Writable({
      write(chunk, _encoding, done) {
        output += chunk.toString()
        done()
      },
    })
    const logger = createLogger(
      { level: "info", service: "redaction-test" },
      destination,
    )

    logger.info({
      delivery: {
        code: "654321",
        phoneNumber: "+8801700000000",
      },
      password: "a-secret-password",
      req: {
        headers: {
          authorization: "Bearer secret-token",
          cookie: "session=secret-cookie",
        },
      },
      safeField: "visible",
      session: { token: "session-token" },
    })

    expect(output).toContain("visible")
    expect(output).not.toContain("654321")
    expect(output).not.toContain("+8801700000000")
    expect(output).not.toContain("a-secret-password")
    expect(output).not.toContain("secret-token")
    expect(output).not.toContain("secret-cookie")
    expect(output).toContain("[Redacted]")
  })
})
