export { createAuth, type CreateAuthOptions, type SportsAuth } from "./auth.js"
export { parseAuthEnvironment, type AuthEnvironment } from "./config.js"
export {
  ensureApplicationIdentity,
  type ApplicationIdentity,
} from "./identity.js"
export {
  DisabledOtpProvider,
  OtpProviderUnavailableError,
  type OtpDelivery,
  type OtpPort,
  type OtpPurpose,
} from "./otp.js"
export { fromNodeHeaders } from "better-auth/node"
