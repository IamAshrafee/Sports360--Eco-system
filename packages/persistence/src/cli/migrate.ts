import { createPool } from "../database.js"
import { parseDatabaseEnvironment } from "../config.js"
import { runMigrations } from "../migrations.js"

const environment = parseDatabaseEnvironment()
const pool = createPool(environment.DATABASE_ADMIN_URL, {
  max: environment.DATABASE_POOL_MAX,
})

try {
  const result = await runMigrations(pool)
  process.stdout.write(
    result.applied.length === 0
      ? "Database schema is already current.\n"
      : `Applied ${result.applied.length} migration(s): ${result.applied
          .map(({ name }) => name)
          .join(", ")}\n`,
  )
} finally {
  await pool.end()
}
