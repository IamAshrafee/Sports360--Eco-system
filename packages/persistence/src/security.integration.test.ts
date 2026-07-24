import { randomUUID } from "node:crypto"

import type { Pool, PoolClient } from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { parseDatabaseEnvironment } from "./config.js"
import { createPool } from "./database.js"
import { runMigrations } from "./migrations.js"
import { demoAuthSubjects, demoIds, seedDemoData } from "./seed.js"

const environment = parseDatabaseEnvironment()
let adminPool: Pool
let runtimePool: Pool

async function inRuntimeTransaction(
  operation: (client: PoolClient) => Promise<void>,
): Promise<void> {
  const client = await runtimePool.connect()
  try {
    await client.query("BEGIN")
    await operation(client)
  } finally {
    await client.query("ROLLBACK").catch(() => undefined)
    client.release()
  }
}

async function establishTenantA(client: PoolClient): Promise<void> {
  await client.query(
    "SELECT * FROM app.establish_user_context($1, $2, $3, $4)",
    [demoAuthSubjects.ownerA, demoIds.businessA, 0, randomUUID()],
  )
}

beforeAll(async () => {
  adminPool = createPool(environment.DATABASE_ADMIN_URL)
  runtimePool = createPool(environment.DATABASE_RUNTIME_URL)
  await runMigrations(adminPool)
  await seedDemoData(adminPool)
})

afterAll(async () => {
  await runtimePool.end()
  await adminPool.end()
})

describe("database security boundary", () => {
  it("gives the runtime role no ownership or RLS bypass privileges", async () => {
    const result = await adminPool.query<{
      rolbypassrls: boolean
      rolcreaterole: boolean
      rolname: string
      rolsuper: boolean
    }>(
      `
        SELECT rolname, rolsuper, rolcreaterole, rolbypassrls
        FROM pg_roles
        WHERE rolname = 'sports_runtime'
      `,
    )

    expect(result.rows).toEqual([
      {
        rolbypassrls: false,
        rolcreaterole: false,
        rolname: "sports_runtime",
        rolsuper: false,
      },
    ])

    const ownership = await adminPool.query<{ runtime_owned_tables: string }>(
      `
        SELECT count(*)::text AS runtime_owned_tables
        FROM pg_class
        WHERE relnamespace = 'app'::regnamespace
          AND relowner = 'sports_runtime'::regrole
      `,
    )
    expect(ownership.rows[0]?.runtime_owned_tables).toBe("0")
  })

  it("denies tenant data until an authorized context is established", async () => {
    await inRuntimeTransaction(async (client) => {
      const beforeContext = await client.query("SELECT id FROM app.businesses")
      expect(beforeContext.rowCount).toBe(0)

      await establishTenantA(client)

      const businesses = await client.query<{ id: string }>(
        "SELECT id FROM app.businesses",
      )
      const venues = await client.query<{ business_id: string; id: string }>(
        "SELECT business_id, id FROM app.venues",
      )

      expect(businesses.rows).toEqual([{ id: demoIds.businessA }])
      expect(venues.rows).toEqual([
        { business_id: demoIds.businessA, id: demoIds.venueA },
      ])

      const attemptedCrossTenantRead = await client.query(
        "SELECT id FROM app.venues WHERE business_id = $1",
        [demoIds.businessB],
      )
      expect(attemptedCrossTenantRead.rowCount).toBe(0)
    })
  })

  it("rejects context establishment without an active membership", async () => {
    await inRuntimeTransaction(async (client) => {
      await expect(
        client.query(
          "SELECT * FROM app.establish_user_context($1, $2, $3, $4)",
          [demoAuthSubjects.ownerA, demoIds.businessB, 0, randomUUID()],
        ),
      ).rejects.toMatchObject({ code: "42501" })
    })
  })

  it("rejects a revoked session version", async () => {
    await inRuntimeTransaction(async (client) => {
      await expect(
        client.query(
          "SELECT * FROM app.establish_user_context($1, $2, $3, $4)",
          [demoAuthSubjects.ownerA, demoIds.businessA, 99, randomUUID()],
        ),
      ).rejects.toMatchObject({ code: "28000" })
    })
  })

  it("keeps platform administration separate from tenant ownership", async () => {
    await expect(
      runtimePool.query("SELECT * FROM app.platform_list_businesses($1, $2)", [
        demoAuthSubjects.ownerA,
        0,
      ]),
    ).rejects.toMatchObject({ code: "42501" })

    await adminPool.query(
      `
        INSERT INTO app.platform_administrators (user_id, permissions)
        VALUES ($1, ARRAY['platform.tenant_admin'])
        ON CONFLICT (user_id) DO UPDATE SET
          state = 'ACTIVE',
          permissions = EXCLUDED.permissions
      `,
      [demoIds.userB],
    )

    try {
      const result = await runtimePool.query<{ id: string }>(
        "SELECT id FROM app.platform_list_businesses($1, $2)",
        [demoAuthSubjects.ownerB, 0],
      )
      expect(result.rows.map(({ id }) => id)).toEqual([
        demoIds.businessA,
        demoIds.businessB,
      ])
    } finally {
      await adminPool.query(
        "DELETE FROM app.platform_administrators WHERE user_id = $1",
        [demoIds.userB],
      )
    }
  })

  it("prevents overlapping claims while allowing adjacent half-open ranges", async () => {
    await inRuntimeTransaction(async (client) => {
      await establishTenantA(client)

      await client.query(
        `
          INSERT INTO app.capacity_claims (
            business_id, venue_id, resource_id, unit_number,
            claim_type, claim_reference_id, during
          )
          VALUES ($1, $2, $3, 1, 'HOLD', $4, tstzrange($5, $6, '[)'))
        `,
        [
          demoIds.businessA,
          demoIds.venueA,
          demoIds.resourceA,
          randomUUID(),
          "2026-08-01T10:00:00+06:00",
          "2026-08-01T11:00:00+06:00",
        ],
      )

      await client.query("SAVEPOINT before_overlap")
      await expect(
        client.query(
          `
            INSERT INTO app.capacity_claims (
              business_id, venue_id, resource_id, unit_number,
              claim_type, claim_reference_id, during
            )
            VALUES ($1, $2, $3, 1, 'HOLD', $4, tstzrange($5, $6, '[)'))
          `,
          [
            demoIds.businessA,
            demoIds.venueA,
            demoIds.resourceA,
            randomUUID(),
            "2026-08-01T10:30:00+06:00",
            "2026-08-01T11:30:00+06:00",
          ],
        ),
      ).rejects.toMatchObject({ code: "23P01" })
      await client.query("ROLLBACK TO SAVEPOINT before_overlap")

      const adjacent = await client.query(
        `
          INSERT INTO app.capacity_claims (
            business_id, venue_id, resource_id, unit_number,
            claim_type, claim_reference_id, during
          )
          VALUES ($1, $2, $3, 1, 'HOLD', $4, tstzrange($5, $6, '[)'))
          RETURNING id
        `,
        [
          demoIds.businessA,
          demoIds.venueA,
          demoIds.resourceA,
          randomUUID(),
          "2026-08-01T11:00:00+06:00",
          "2026-08-01T12:00:00+06:00",
        ],
      )
      expect(adjacent.rowCount).toBe(1)
    })
  })

  it("reclaims abandoned outbox work and completes it idempotently", async () => {
    const messageId = await (async () => {
      const client = await runtimePool.connect()
      try {
        await client.query("BEGIN")
        await establishTenantA(client)
        const inserted = await client.query<{ id: string }>(
          `
            INSERT INTO app.outbox_messages (
              business_id, topic, aggregate_type, aggregate_id, payload
            )
            VALUES ($1, 'security.proof', 'business', $2, '{}'::jsonb)
            RETURNING id
          `,
          [demoIds.businessA, demoIds.businessA],
        )
        await client.query("COMMIT")
        return inserted.rows[0]?.id
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined)
        throw error
      } finally {
        client.release()
      }
    })()

    expect(messageId).toBeDefined()

    try {
      const firstClaim = await runtimePool.query<{ id: string }>(
        "SELECT id FROM app.claim_outbox_messages($1, $2)",
        ["crashed-worker", 1],
      )
      expect(firstClaim.rows).toEqual([{ id: messageId }])

      const reclaimed = await runtimePool.query<{
        attempts: number
        id: string
      }>(
        `
          SELECT id, attempts
          FROM app.claim_outbox_messages($1, $2, interval '0 seconds')
        `,
        ["replacement-worker", 1],
      )
      expect(reclaimed.rows).toEqual([{ attempts: 2, id: messageId }])

      const completed = await runtimePool.query<{ completed: boolean }>(
        "SELECT app.complete_outbox_message($1, $2) AS completed",
        [messageId, "replacement-worker"],
      )
      expect(completed.rows[0]?.completed).toBe(true)

      const duplicateCompletion = await runtimePool.query<{
        completed: boolean
      }>("SELECT app.complete_outbox_message($1, $2) AS completed", [
        messageId,
        "replacement-worker",
      ])
      expect(duplicateCompletion.rows[0]?.completed).toBe(false)
    } finally {
      await adminPool.query("DELETE FROM app.outbox_messages WHERE id = $1", [
        messageId,
      ])
    }
  })

  it("records actor context and keeps audit entries immutable", async () => {
    const auditId = await (async () => {
      const client = await runtimePool.connect()
      try {
        await client.query("BEGIN")
        await establishTenantA(client)
        const result = await client.query<{ id: string }>(
          `
            SELECT app.record_audit_entry(
              'security.proof',
              'business',
              $1,
              NULL,
              jsonb_build_object('verified', true),
              jsonb_build_object('test', 'database-security')
            ) AS id
          `,
          [demoIds.businessA],
        )
        await client.query("COMMIT")
        return result.rows[0]?.id
      } finally {
        client.release()
      }
    })()

    expect(auditId).toBeDefined()
    await expect(
      adminPool.query(
        "UPDATE app.audit_entries SET action = 'tampered' WHERE id = $1",
        [auditId],
      ),
    ).rejects.toMatchObject({ code: "55000" })
  })

  it("keeps ordered migrations idempotent", async () => {
    const result = await runMigrations(adminPool)
    expect(result.applied).toEqual([])
    expect(result.previouslyApplied.map(({ name }) => name)).toEqual([
      "001_identity_tenancy_access.sql",
      "002_resources_and_capacity.sql",
      "003_qualify_tenant_context.sql",
      "004_security_definer_owner_access.sql",
      "005_configuration_core.sql",
      "006_configuration_invariant_hardening.sql",
    ])
  })
})
