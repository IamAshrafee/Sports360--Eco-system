import { z } from "zod"

const authEnvironmentSchema = z.object({
  BETTER_AUTH_BASE_URL: z.url().default("http://localhost:4000"),
  BETTER_AUTH_SECRET: z.string().min(32),
  DATABASE_AUTH_URL: z.url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
})

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>

export function parseAuthEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): AuthEnvironment {
  return authEnvironmentSchema.parse(environment)
}
