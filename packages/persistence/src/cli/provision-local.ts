import { parseDatabaseEnvironment } from "../config.js"
import { createPool } from "../database.js"

const environment = parseDatabaseEnvironment()
const pool = createPool(environment.DATABASE_ADMIN_URL, { max: 1 })

try {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sports_runtime') THEN
        CREATE ROLE sports_runtime
          LOGIN PASSWORD 'sports_runtime_local'
          NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      ELSE
        ALTER ROLE sports_runtime
          LOGIN PASSWORD 'sports_runtime_local'
          NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      END IF;

      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sports_auth') THEN
        CREATE ROLE sports_auth
          LOGIN PASSWORD 'sports_auth_local'
          NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      ELSE
        ALTER ROLE sports_auth
          LOGIN PASSWORD 'sports_auth_local'
          NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      END IF;
    END
    $$;
  `)
  process.stdout.write("Local database roles are provisioned.\n")
} finally {
  await pool.end()
}
