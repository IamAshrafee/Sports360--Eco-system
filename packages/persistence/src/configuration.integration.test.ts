import { randomUUID } from "node:crypto"

import type { ActorContext } from "@sports/contracts"
import type { Pool, PoolClient } from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import {
  ConfigurationPersistenceError,
  createActivity,
  createOffering,
  createResource,
  listActivities,
  listOfferings,
  listResources,
  updateActivity,
} from "./configuration.js"
import { parseDatabaseEnvironment } from "./config.js"
import { createPool } from "./database.js"
import { runMigrations } from "./migrations.js"
import { demoAuthSubjects, demoIds, seedDemoData } from "./seed.js"

const staff = {
  booking: {
    authSubject: "configuration-booking-staff",
    authUserId: "configuration-booking-staff",
    membershipId: "019b7000-0000-7000-8000-000000000612",
    profile: "BOOKING_STAFF",
    userId: "019b7000-0000-7000-8000-000000000611",
  },
  finance: {
    authSubject: "configuration-finance",
    authUserId: "configuration-finance",
    membershipId: "019b7000-0000-7000-8000-000000000622",
    profile: "FINANCE_REPORTS",
    userId: "019b7000-0000-7000-8000-000000000621",
  },
  manager: {
    authSubject: "configuration-manager",
    authUserId: "configuration-manager",
    membershipId: "019b7000-0000-7000-8000-000000000602",
    profile: "MANAGER",
    userId: "019b7000-0000-7000-8000-000000000601",
  },
} as const

const environment = parseDatabaseEnvironment()
let adminPool: Pool
let runtimePool: Pool

async function seedStaff(): Promise<void> {
  for (const person of Object.values(staff)) {
    await adminPool.query(
      `
        INSERT INTO auth."user" (
          id, name, email, "emailVerified", "phoneNumberVerified"
        )
        VALUES ($1, $2, $3, true, true)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `,
      [person.authUserId, person.profile, `${person.authUserId}@example.test`],
    )
    await adminPool.query(
      `
        INSERT INTO app.users (id, auth_subject_id, display_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name
      `,
      [person.userId, person.authSubject, person.profile],
    )
    await adminPool.query(
      `
        INSERT INTO app.memberships (
          id, business_id, user_id, profile_code, state, scope_mode
        )
        VALUES ($1, $2, $3, $4, 'ACTIVE', 'SELECTED_VENUES')
        ON CONFLICT (business_id, user_id) DO UPDATE SET
          profile_code = EXCLUDED.profile_code,
          state = EXCLUDED.state,
          scope_mode = EXCLUDED.scope_mode
      `,
      [person.membershipId, demoIds.businessA, person.userId, person.profile],
    )
    await adminPool.query(
      `
        INSERT INTO app.membership_venue_scopes (
          business_id, membership_id, venue_id
        )
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `,
      [demoIds.businessA, person.membershipId, demoIds.venueA],
    )
  }
}

async function inRuntimeTransaction(
  subject: string,
  businessId: string,
  operation: (client: PoolClient, actor: ActorContext) => Promise<void>,
): Promise<void> {
  const client = await runtimePool.connect()
  try {
    await client.query("BEGIN")
    const context = await client.query<{
      access_version: number
      allowed_venue_ids: string[]
      business_id: string
      business_wide: boolean
      membership_id: string
      permissions: ActorContext["permissions"]
      profile_code: ActorContext["profileCode"]
      session_version: number
      user_id: string
    }>("SELECT * FROM app.establish_user_context($1, $2, 0, $3)", [
      subject,
      businessId,
      randomUUID(),
    ])
    const row = context.rows[0]!
    await operation(client, {
      accessVersion: row.access_version,
      allowedVenueIds: row.allowed_venue_ids,
      businessId: row.business_id,
      businessWide: row.business_wide,
      correlationId: randomUUID(),
      membershipId: row.membership_id,
      permissions: row.permissions,
      profileCode: row.profile_code,
      sessionVersion: row.session_version,
      userId: row.user_id,
    })
  } finally {
    await client.query("ROLLBACK").catch(() => undefined)
    client.release()
  }
}

beforeAll(async () => {
  adminPool = createPool(environment.DATABASE_ADMIN_URL)
  runtimePool = createPool(environment.DATABASE_RUNTIME_URL)
  await runMigrations(adminPool)
  await seedDemoData(adminPool)
  await seedStaff()
})

afterAll(async () => {
  await runtimePool.end()
  await adminPool.end()
})

describe("configuration persistence", () => {
  it("migrates an empty database to head and repeats without changes", async () => {
    const databaseName = `sports_configuration_${randomUUID().replaceAll("-", "")}`
    if (!/^sports_configuration_[a-f0-9]{32}$/.test(databaseName)) {
      throw new Error("Temporary database name is not safely scoped")
    }

    const maintenanceUrl = new URL(environment.DATABASE_ADMIN_URL)
    maintenanceUrl.pathname = "/postgres"
    const maintenancePool = createPool(maintenanceUrl.toString())
    const temporaryUrl = new URL(environment.DATABASE_ADMIN_URL)
    temporaryUrl.pathname = `/${databaseName}`
    let temporaryPool: Pool | undefined

    try {
      await maintenancePool.query(`CREATE DATABASE "${databaseName}"`)
      temporaryPool = createPool(temporaryUrl.toString())

      const first = await runMigrations(temporaryPool)
      expect(first.applied.map(({ name }) => name)).toEqual([
        "001_identity_tenancy_access.sql",
        "002_resources_and_capacity.sql",
        "003_qualify_tenant_context.sql",
        "004_security_definer_owner_access.sql",
        "005_configuration_core.sql",
        "006_configuration_invariant_hardening.sql",
      ])

      const repeated = await runMigrations(temporaryPool)
      expect(repeated.applied).toEqual([])
      expect(repeated.previouslyApplied).toHaveLength(6)
    } finally {
      await temporaryPool?.end()
      await maintenancePool
        .query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`)
        .finally(async () => maintenancePool.end())
    }
  })

  it("denies all configuration rows before tenant context", async () => {
    const [activities, resources, offerings] = await Promise.all([
      runtimePool.query("SELECT id FROM app.activities"),
      runtimePool.query("SELECT id FROM app.resources"),
      runtimePool.query("SELECT id FROM app.offerings"),
    ])

    expect(activities.rowCount).toBe(0)
    expect(resources.rowCount).toBe(0)
    expect(offerings.rowCount).toBe(0)
  })

  it("preserves deterministic single-turf seeded meaning", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const activities = await listActivities(client, actor, { limit: 100 })
        const resources = await listResources(client, actor, demoIds.venueA, {
          limit: 100,
        })
        const offerings = await listOfferings(client, actor, demoIds.venueA, {
          limit: 100,
        })

        expect(activities.items).toEqual([
          expect.objectContaining({
            code: "football",
            displayName: "Football",
          }),
        ])
        expect(resources.items).toEqual([
          expect.objectContaining({
            id: demoIds.resourceA,
            name: "Football Turf 1",
          }),
        ])
        expect(offerings.items).toEqual([
          expect.objectContaining({
            durationMinutes: 60,
            id: demoIds.offeringA,
            resourceIds: [demoIds.resourceA],
          }),
        ])
      },
    )
  })

  it("creates a mixed-sport configuration and audits each mutation", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const cricket = await createActivity(client, actor, {
          code: "cricket",
          displayName: "Cricket",
          state: "ACTIVE",
        })
        const tableTennis = await createActivity(client, actor, {
          code: "table-tennis",
          displayName: "Table Tennis",
          state: "ACTIVE",
        })
        const cricketNet = await createResource(client, actor, demoIds.venueA, {
          activityId: cricket.id,
          name: "Cricket Net 1",
          state: "ACTIVE",
        })
        const table = await createResource(client, actor, demoIds.venueA, {
          activityId: tableTennis.id,
          name: "Table 1",
          state: "ACTIVE",
        })
        await createOffering(client, actor, demoIds.venueA, {
          activityId: cricket.id,
          durationMinutes: 90,
          name: "Cricket practice",
          resourceIds: [cricketNet.id],
          state: "ACTIVE",
        })
        await createOffering(client, actor, demoIds.venueA, {
          activityId: tableTennis.id,
          durationMinutes: 60,
          name: "Table tennis",
          resourceIds: [table.id],
          state: "ACTIVE",
        })

        const audit = await client.query<{ action: string }>(
          `
            SELECT action
            FROM app.audit_entries
            WHERE business_id = $1
              AND action LIKE 'configuration.%'
            ORDER BY occurred_at, id
          `,
          [demoIds.businessA],
        )
        expect(audit.rows.map(({ action }) => action)).toEqual([
          "configuration.activity.created",
          "configuration.activity.created",
          "configuration.resource.created",
          "configuration.resource.created",
          "configuration.offering.created",
          "configuration.offering.created",
        ])
      },
    )
  })

  it("allows a venue-scoped Manager to configure only the assigned venue", async () => {
    await inRuntimeTransaction(
      staff.manager.authSubject,
      demoIds.businessA,
      async (client, actor) => {
        const activity = await createActivity(client, actor, {
          code: "manager-activity",
          displayName: "Manager Activity",
          state: "ACTIVE",
        })
        const resource = await createResource(client, actor, demoIds.venueA, {
          activityId: activity.id,
          name: "Manager Resource",
          state: "ACTIVE",
        })
        expect(resource.venueId).toBe(demoIds.venueA)

        await expect(
          createResource(client, actor, demoIds.venueB, {
            activityId: activity.id,
            name: "Foreign venue resource",
            state: "ACTIVE",
          }),
        ).rejects.toMatchObject({
          code: "INCOMPATIBLE_RELATIONSHIP",
        })
      },
    )
  })

  it("keeps resource-unit reads inside the Manager's venue scope", async () => {
    const otherVenueId = "019b7000-0000-7000-8000-000000000291"
    const otherResourceId = "019b7000-0000-7000-8000-000000000391"
    const activity = await adminPool.query<{ id: string }>(
      `
        SELECT id FROM app.activities
        WHERE business_id = $1 AND code = 'football'
      `,
      [demoIds.businessA],
    )

    await adminPool.query(
      `
        INSERT INTO app.venues (id, business_id, name, state)
        VALUES ($1, $2, 'Unassigned Venue', 'ACTIVE')
        ON CONFLICT (business_id, id) DO NOTHING
      `,
      [otherVenueId, demoIds.businessA],
    )
    await adminPool.query(
      `
        INSERT INTO app.resources (
          id, business_id, venue_id, activity_id,
          activity_code, name, capacity, state
        )
        VALUES ($1, $2, $3, $4, 'football', 'Unassigned Turf', 1, 'ACTIVE')
        ON CONFLICT (business_id, id) DO NOTHING
      `,
      [otherResourceId, demoIds.businessA, otherVenueId, activity.rows[0]!.id],
    )
    await adminPool.query(
      `
        INSERT INTO app.resource_units (business_id, resource_id, unit_number)
        VALUES ($1, $2, 1)
        ON CONFLICT DO NOTHING
      `,
      [demoIds.businessA, otherResourceId],
    )

    try {
      await inRuntimeTransaction(
        staff.manager.authSubject,
        demoIds.businessA,
        async (client) => {
          const visible = await client.query<{ resource_id: string }>(
            `
              SELECT resource_id
              FROM app.resource_units
              ORDER BY resource_id
            `,
          )
          expect(visible.rows).toEqual([{ resource_id: demoIds.resourceA }])
        },
      )
    } finally {
      await adminPool.query(
        "DELETE FROM app.resources WHERE business_id = $1 AND id = $2",
        [demoIds.businessA, otherResourceId],
      )
      await adminPool.query(
        "DELETE FROM app.venues WHERE business_id = $1 AND id = $2",
        [demoIds.businessA, otherVenueId],
      )
    }
  })

  it.each([
    ["Booking Staff", staff.booking.authSubject],
    ["Finance/Reports", staff.finance.authSubject],
  ])("denies %s mutation at the PostgreSQL policy", async (_, subject) => {
    await inRuntimeTransaction(subject, demoIds.businessA, async (client) => {
      await expect(
        client.query(
          `
              INSERT INTO app.activities (
                business_id, code, display_name, state
              )
              VALUES ($1, $2, 'Denied Activity', 'ACTIVE')
            `,
          [demoIds.businessA, `denied-${randomUUID()}`],
        ),
      ).rejects.toMatchObject({ code: "42501" })
    })
  })

  it("does not expose or accept another tenant's configuration identifiers", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const foreignActivities = await client.query(
          "SELECT id FROM app.activities WHERE business_id = $1",
          [demoIds.businessB],
        )
        expect(foreignActivities.rowCount).toBe(0)

        const foreignActivity = await adminPool.query<{ id: string }>(
          `
            SELECT id FROM app.activities
            WHERE business_id = $1 AND code = 'badminton'
          `,
          [demoIds.businessB],
        )
        await expect(
          createResource(client, actor, demoIds.venueA, {
            activityId: foreignActivity.rows[0]!.id,
            name: "Cross tenant resource",
            state: "ACTIVE",
          }),
        ).rejects.toBeInstanceOf(ConfigurationPersistenceError)
      },
    )
  })

  it("rejects a stale version without a persistence effect", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const created = await createActivity(client, actor, {
          code: "version-proof",
          displayName: "Version Proof",
          state: "ACTIVE",
        })
        const updated = await updateActivity(client, actor, created.id, {
          displayName: "Version Proof Updated",
          expectedVersion: created.version,
        })
        expect(updated.version).toBe(2)

        await expect(
          updateActivity(client, actor, created.id, {
            displayName: "Stale Write",
            expectedVersion: created.version,
          }),
        ).rejects.toMatchObject({ code: "STALE_VERSION" })
      },
    )
  })

  it("enforces active-offering compatibility at transaction constraint time", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client) => {
        const activity = await client.query<{ id: string }>(
          `
            SELECT id FROM app.activities
            WHERE business_id = $1 AND code = 'football'
          `,
          [demoIds.businessA],
        )
        await client.query("SAVEPOINT before_invalid_offering")
        await client.query(
          `
            INSERT INTO app.offerings (
              business_id, venue_id, activity_id,
              name, duration_minutes, state
            )
            VALUES ($1, $2, $3, 'Invalid Active Offering', 60, 'ACTIVE')
          `,
          [demoIds.businessA, demoIds.venueA, activity.rows[0]!.id],
        )
        await expect(
          client.query("SET CONSTRAINTS ALL IMMEDIATE"),
        ).rejects.toMatchObject({ code: "23514" })
        await client.query("ROLLBACK TO SAVEPOINT before_invalid_offering")
      },
    )
  })

  it("prevents deactivating an activity used by an active offering", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client) => {
        const activity = await client.query<{ id: string }>(
          `
            SELECT id FROM app.activities
            WHERE business_id = $1 AND code = 'football'
          `,
          [demoIds.businessA],
        )
        await client.query("SAVEPOINT before_activity_deactivation")
        await client.query(
          `
            UPDATE app.activities
            SET state = 'INACTIVE', version = version + 1
            WHERE business_id = $1 AND id = $2
          `,
          [demoIds.businessA, activity.rows[0]!.id],
        )
        await expect(
          client.query("SET CONSTRAINTS ALL IMMEDIATE"),
        ).rejects.toMatchObject({ code: "23514" })
        await client.query("ROLLBACK TO SAVEPOINT before_activity_deactivation")
      },
    )
  })
})
