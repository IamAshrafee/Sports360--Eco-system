import { describe, expect, it } from "vitest"

import {
  DisabledOtpProvider,
  OtpProviderUnavailableError,
  type OtpDelivery,
  type OtpPort,
} from "./otp.js"

class CapturingOtpProvider implements OtpPort {
  readonly deliveries: OtpDelivery[] = []

  async send(delivery: OtpDelivery): Promise<void> {
    this.deliveries.push(delivery)
  }
}

describe("OTP provider boundary", () => {
  it("delivers through an interchangeable port", async () => {
    const provider = new CapturingOtpProvider()
    const delivery: OtpDelivery = {
      code: "123456",
      phoneNumber: "+8801700000000",
      purpose: "PHONE_NUMBER_VERIFICATION",
    }

    await provider.send(delivery)

    expect(provider.deliveries).toEqual([delivery])
  })

  it("fails closed when no provider is configured", async () => {
    await expect(
      new DisabledOtpProvider().send({
        code: "not-logged",
        phoneNumber: "+8801700000000",
        purpose: "PHONE_NUMBER_VERIFICATION",
      }),
    ).rejects.toBeInstanceOf(OtpProviderUnavailableError)
  })
})
