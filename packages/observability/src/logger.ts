import pino, {
  type DestinationStream,
  type Logger,
  type LoggerOptions,
} from "pino"

export const sensitiveLogPaths = [
  "authorization",
  "cookie",
  "password",
  "token",
  "otp",
  "phoneNumber",
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.set-cookie",
  "delivery.code",
  "delivery.phoneNumber",
  "session.token",
  "user.phoneNumber",
] as const

export interface LoggerConfiguration {
  level: NonNullable<LoggerOptions["level"]>
  service: string
}

export function loggerOptions({
  level,
  service,
}: LoggerConfiguration): LoggerOptions {
  return {
    base: { service },
    level,
    redact: {
      censor: "[Redacted]",
      paths: [...sensitiveLogPaths],
    },
  }
}

export function createLogger(
  configuration: LoggerConfiguration,
  destination?: DestinationStream,
): Logger {
  return pino(loggerOptions(configuration), destination)
}
