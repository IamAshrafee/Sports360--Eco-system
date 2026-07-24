import { z } from "zod"

const apiEnvironmentSchema = z
  .object({
    API_CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    API_HOST: z.string().default("0.0.0.0"),
    API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    BETTER_AUTH_BASE_URL: z.url().default("http://localhost:4000"),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32)
      .default("local-only-change-this-auth-secret-0001"),
    DATABASE_AUTH_URL: z
      .url()
      .default(
        "postgresql://sports_auth:sports_auth_local@localhost:55432/sports_management?options=-c%20search_path%3Dauth",
      ),
    DATABASE_RUNTIME_URL: z
      .url()
      .default(
        "postgresql://sports_runtime:sports_runtime_local@localhost:55432/sports_management",
      ),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === "production" &&
      value.BETTER_AUTH_SECRET === "local-only-change-this-auth-secret-0001"
    ) {
      context.addIssue({
        code: "custom",
        message: "Production requires an explicit BETTER_AUTH_SECRET.",
        path: ["BETTER_AUTH_SECRET"],
      })
    }
  })

export type ApiConfig = z.output<typeof apiEnvironmentSchema>

export function readApiConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfig {
  return apiEnvironmentSchema.parse(environment)
}
