import { parseDatabaseEnvironment } from "../config.js"
import { createPool } from "../database.js"
import { seedDemoData } from "../seed.js"

const environment = parseDatabaseEnvironment()
const pool = createPool(environment.DATABASE_ADMIN_URL, {
  max: environment.DATABASE_POOL_MAX,
})

try {
  await seedDemoData(pool)
  process.stdout.write("Demo data is current.\n")
} finally {
  await pool.end()
}
