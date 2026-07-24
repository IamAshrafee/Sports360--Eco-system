import { z } from "zod"

const databaseEnvironmentSchema = z.object({
  DATABASE_ADMIN_URL: z
    .url()
    .default(
      "postgresql://sports_migrator:sports_migrator_local@localhost:55432/sports_management",
    ),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().max(50).default(10),
  DATABASE_RUNTIME_URL: z
    .url()
    .default(
      "postgresql://sports_runtime:sports_runtime_local@localhost:55432/sports_management",
    ),
})

export type DatabaseEnvironment = z.infer<typeof databaseEnvironmentSchema>

export function parseDatabaseEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): DatabaseEnvironment {
  return databaseEnvironmentSchema.parse(environment)
}
