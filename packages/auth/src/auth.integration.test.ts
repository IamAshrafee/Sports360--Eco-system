import { randomInt } from "node:crypto"

import { Pool } from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { createAuth } from "./auth.js"
import { ensureApplicationIdentity } from "./identity.js"
import type { OtpDelivery, OtpPort } from "./otp.js"

const authPool = new Pool({
  connectionString:
    process.env.DATABASE_AUTH_URL ??
    "postgresql://sports_auth:sports_auth_local@localhost:55432/sports_management?options=-c%20search_path%3Dauth",
})
const runtimePool = new Pool({
  connectionString:
    process.env.DATABASE_RUNTIME_URL ??
    "postgresql://sports_runtime:sports_runtime_local@localhost:55432/sports_management",
})
const adminPool = new Pool({
  connectionString:
    process.env.DATABASE_ADMIN_URL ??
    "postgresql://sports_migrator:sports_migrator_local@localhost:55432/sports_management",
})

class CapturingOtpProvider implements OtpPort {
  delivery?: OtpDelivery

  async send(delivery: OtpDelivery): Promise<void> {
    this.delivery = delivery
  }
}

const provider = new CapturingOtpProvider()
const auth = createAuth({
  authPool,
  config: {
    BETTER_AUTH_BASE_URL: "http://localhost:4000",
    BETTER_AUTH_SECRET: "integration-secret-with-at-least-32-characters",
    DATABASE_AUTH_URL:
      "postgresql://sports_auth:sports_auth_local@localhost:55432/sports_management",
    NODE_ENV: "test",
  },
  otp: provider,
  trustedOrigins: ["http://localhost:3000"],
})
const phoneNumber = `+88017${randomInt(10_000_000, 99_999_999)}`
let authSubjectId: string | undefined
let applicationUserId: string | undefined

function authRequest(path: string, body: unknown): Request {
  return new Request(`http://localhost:4000/v1/auth${path}`, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    method: "POST",
  })
}

beforeAll(async () => {
  await authPool.query("SELECT 1")
})

afterAll(async () => {
  if (applicationUserId !== undefined) {
    await adminPool.query("DELETE FROM app.users WHERE id = $1", [
      applicationUserId,
    ])
  }
  if (authSubjectId !== undefined) {
    await adminPool.query('DELETE FROM auth."user" WHERE id = $1', [
      authSubjectId,
    ])
  }
  await Promise.all([authPool.end(), runtimePool.end(), adminPool.end()])
})

describe("Better Auth PostgreSQL integration", () => {
  it("verifies a Bangladesh phone number and maps the auth subject", async () => {
    const sendResponse = await auth.handler(
      authRequest("/phone-number/send-otp", { phoneNumber }),
    )
    expect(sendResponse.status).toBe(200)
    expect(provider.delivery).toMatchObject({
      phoneNumber,
      purpose: "PHONE_NUMBER_VERIFICATION",
    })

    const verifyResponse = await auth.handler(
      authRequest("/phone-number/verify", {
        code: provider.delivery?.code,
        disableSession: false,
        phoneNumber,
        updatePhoneNumber: false,
      }),
    )
    expect(verifyResponse.status).toBe(200)
    expect(verifyResponse.headers.get("set-cookie")).toContain(
      "sports_management",
    )

    const subject = await adminPool.query<{ id: string; name: string }>(
      'SELECT id, name FROM auth."user" WHERE "phoneNumber" = $1',
      [phoneNumber],
    )
    expect(subject.rowCount).toBe(1)
    authSubjectId = subject.rows[0]?.id

    const identity = await ensureApplicationIdentity(
      runtimePool,
      authSubjectId ?? "",
      subject.rows[0]?.name ?? phoneNumber,
    )
    applicationUserId = identity.userId

    expect(identity).toMatchObject({
      sessionVersion: 0,
      state: "ACTIVE",
    })
  })
})
