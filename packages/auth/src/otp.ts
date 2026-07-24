export type OtpPurpose =
  "PHONE_NUMBER_VERIFICATION" | "PHONE_NUMBER_PASSWORD_RESET"

export interface OtpDelivery {
  code: string
  phoneNumber: string
  purpose: OtpPurpose
}

export interface OtpPort {
  send(delivery: OtpDelivery): Promise<void>
}

export class OtpProviderUnavailableError extends Error {
  override readonly name = "OtpProviderUnavailableError"

  constructor() {
    super("OTP delivery is not configured")
  }
}

export class DisabledOtpProvider implements OtpPort {
  async send(delivery: OtpDelivery): Promise<never> {
    void delivery
    throw new OtpProviderUnavailableError()
  }
}
