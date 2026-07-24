import { createHash } from "node:crypto"

import { betterAuth } from "better-auth"
import { phoneNumber } from "better-auth/plugins"
import type { Pool } from "pg"

import type { AuthEnvironment } from "./config.js"
import type { OtpPort } from "./otp.js"

const bangladeshPhoneNumber = /^\+8801[3-9]\d{8}$/

function temporaryEmail(phone: string): string {
  const digest = createHash("sha256").update(phone).digest("hex").slice(0, 32)
  return `${digest}@phone.sports.invalid`
}

export interface CreateAuthOptions {
  authPool: Pool
  config: AuthEnvironment
  otp: OtpPort
  trustedOrigins: string[]
}

export function createAuth({
  authPool,
  config,
  otp,
  trustedOrigins,
}: CreateAuthOptions) {
  return betterAuth({
    advanced: {
      cookiePrefix: "sports_management",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
      },
    },
    basePath: "/v1/auth",
    baseURL: config.BETTER_AUTH_BASE_URL,
    database: authPool,
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      phoneNumber({
        expiresIn: 300,
        otpLength: 6,
        phoneNumberValidator: (phone) => bangladeshPhoneNumber.test(phone),
        sendOTP: ({ code, phoneNumber: recipient }) =>
          otp.send({
            code,
            phoneNumber: recipient,
            purpose: "PHONE_NUMBER_VERIFICATION",
          }),
        sendPasswordResetOTP: ({ code, phoneNumber: recipient }) =>
          otp.send({
            code,
            phoneNumber: recipient,
            purpose: "PHONE_NUMBER_PASSWORD_RESET",
          }),
        signUpOnVerification: {
          getTempEmail: temporaryEmail,
          getTempName: (phone) => phone,
        },
      }),
    ],
    secret: config.BETTER_AUTH_SECRET,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
    },
    trustedOrigins,
  })
}

export type SportsAuth = ReturnType<typeof createAuth>
