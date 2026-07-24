import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import type { Pool, PoolClient } from "pg"

const migrationNamePattern = /^\d{3}_[a-z0-9_]+\.sql$/
const advisoryLockKey = 8_675_309_921

export interface AppliedMigration {
  checksum: string
  name: string
}

export interface MigrationResult {
  applied: AppliedMigration[]
  previouslyApplied: AppliedMigration[]
}

async function ensureLedger(client: PoolClient): Promise<void> {
  await client.query("CREATE SCHEMA IF NOT EXISTS app")
  await client.query(`
    CREATE TABLE IF NOT EXISTS app.schema_migrations (
      name text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `)
}

function checksum(contents: string): string {
  return createHash("sha256").update(contents).digest("hex")
}

export async function runMigrations(
  pool: Pool,
  migrationDirectory = fileURLToPath(new URL("../migrations", import.meta.url)),
): Promise<MigrationResult> {
  const client = await pool.connect()
  const applied: AppliedMigration[] = []

  try {
    await client.query("SELECT pg_advisory_lock($1)", [advisoryLockKey])
    await ensureLedger(client)

    const filenames = (await readdir(migrationDirectory))
      .filter((name) => migrationNamePattern.test(name))
      .sort()

    const ledger = await client.query<AppliedMigration>(
      "SELECT name, checksum FROM app.schema_migrations ORDER BY name",
    )
    const existing = new Map(
      ledger.rows.map((migration) => [migration.name, migration.checksum]),
    )

    for (const name of filenames) {
      const contents = await readFile(join(migrationDirectory, name), "utf8")
      const fileChecksum = checksum(contents)
      const previousChecksum = existing.get(name)

      if (previousChecksum !== undefined) {
        if (previousChecksum !== fileChecksum) {
          throw new Error(
            `Applied migration ${name} has changed. Create a new migration instead.`,
          )
        }
        continue
      }

      await client.query("BEGIN")
      try {
        await client.query(contents)
        await client.query(
          "INSERT INTO app.schema_migrations (name, checksum) VALUES ($1, $2)",
          [name, fileChecksum],
        )
        await client.query("COMMIT")
        applied.push({ checksum: fileChecksum, name })
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      }
    }

    return {
      applied,
      previouslyApplied: ledger.rows,
    }
  } finally {
    await client
      .query("SELECT pg_advisory_unlock($1)", [advisoryLockKey])
      .catch(() => undefined)
    client.release()
  }
}
