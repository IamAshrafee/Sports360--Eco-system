import { randomUUID } from "node:crypto"

import type { ActorContext, CreateScheduleVersion } from "@sports/contracts"
import type { Pool, PoolClient } from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { parseDatabaseEnvironment } from "./config.js"
import { createPool } from "./database.js"
import { runMigrations } from "./migrations.js"
import {
  createScheduleVersion,
  listScheduleVersions,
  previewFixedSlots,
} from "./schedule.js"
import { demoAuthSubjects, demoIds, seedDemoData } from "./seed.js"

const staff = {
  booking: {
    authSubject: "schedule-booking-staff",
    authUserId: "schedule-booking-staff",
    membershipId: "019b7000-0000-7000-8000-000000000712",
    profile: "BOOKING_STAFF",
    userId: "019b7000-0000-7000-8000-000000000711",
  },
  finance: {
    authSubject: "schedule-finance",
    authUserId: "schedule-finance",
    membershipId: "019b7000-0000-7000-8000-000000000722",
    profile: "FINANCE_REPORTS",
    userId: "019b7000-0000-7000-8000-000000000721",
  },
  manager: {
    authSubject: "schedule-manager",
    authUserId: "schedule-manager",
    membershipId: "019b7000-0000-7000-8000-000000000702",
    profile: "MANAGER",
    userId: "019b7000-0000-7000-8000-000000000701",
  },
} as const

const environment = parseDatabaseEnvironment()
let adminPool: Pool
let runtimePool: Pool

const daytimeSchedule: CreateScheduleVersion = {
  effectiveFrom: "2026-07-01",
  exceptions: [],
  weeklyPeriods: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    closesAt: "23:00",
    crossesMidnight: false,
    opensAt: "08:00",
    weekday,
  })),
}

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

async function inRuntimeTransaction<Result>(
  subject: string,
  businessId: string,
  operation: (client: PoolClient, actor: ActorContext) => Promise<Result>,
): Promise<Result> {
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
    return await operation(client, {
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

describe("schedule persistence", () => {
  it("denies schedule rows before tenant context", async () => {
    const [versions, weekly, exceptions] = await Promise.all([
      runtimePool.query("SELECT id FROM app.schedule_versions"),
      runtimePool.query("SELECT id FROM app.weekly_schedule_periods"),
      runtimePool.query("SELECT id FROM app.schedule_exceptions"),
    ])
    expect(versions.rowCount).toBe(0)
    expect(weekly.rowCount).toBe(0)
    expect(exceptions.rowCount).toBe(0)
  })

  it("creates an immutable audited venue schedule and previews V-01 slots", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const schedule = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          {
            ...daytimeSchedule,
            exceptions: [
              {
                kind: "CLOSED",
                localDate: "2026-07-28",
                periods: [],
                reason: "Private event",
              },
            ],
          },
        )

        expect(schedule).toEqual(
          expect.objectContaining({
            effectiveFrom: "2026-07-01",
            effectiveUntil: null,
            resourceId: null,
            scope: "VENUE",
            timezone: "Asia/Dhaka",
            version: 1,
          }),
        )
        expect(schedule.weeklyPeriods).toHaveLength(7)
        expect(schedule.exceptions).toEqual([
          {
            kind: "CLOSED",
            localDate: "2026-07-28",
            periods: [],
            reason: "Private event",
          },
        ])

        const preview = await previewFixedSlots(client, actor, demoIds.venueA, {
          offeringId: demoIds.offeringA,
          operationalDate: "2026-07-27",
          resourceId: demoIds.resourceA,
        })
        expect(preview.scheduleScope).toBe("VENUE")
        expect(preview.offeringDurationMinutes).toBe(60)
        expect(preview.slots).toHaveLength(15)
        expect(preview.slots[0]).toEqual(
          expect.objectContaining({
            localStart: "2026-07-27T08:00:00+06:00",
            localEnd: "2026-07-27T09:00:00+06:00",
          }),
        )
        expect(
          preview.slots.every(
            (slot, index) =>
              index === 0 || preview.slots[index - 1]!.endAt === slot.startAt,
          ),
        ).toBe(true)

        const closed = await previewFixedSlots(client, actor, demoIds.venueA, {
          offeringId: demoIds.offeringA,
          operationalDate: "2026-07-28",
          resourceId: demoIds.resourceA,
        })
        expect(closed.slots).toEqual([])

        const audit = await client.query<{ action: string }>(
          `
            SELECT action
            FROM app.audit_entries
            WHERE business_id = $1
              AND entity_id = $2
          `,
          [demoIds.businessA, schedule.id],
        )
        expect(audit.rows).toEqual([
          { action: "configuration.schedule.created" },
        ])

        await expect(
          client.query(
            `
              UPDATE app.weekly_schedule_periods
              SET opens_at = '07:00'
              WHERE schedule_version_id = $1
            `,
            [schedule.id],
          ),
        ).rejects.toMatchObject({ code: "42501" })
      },
    )
  })

  it("inserts versions into a non-overlapping effective timeline", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const first = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          { ...daytimeSchedule, effectiveFrom: "2026-07-01" },
        )
        const third = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          { ...daytimeSchedule, effectiveFrom: "2026-09-01" },
        )
        const second = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          { ...daytimeSchedule, effectiveFrom: "2026-08-01" },
        )

        const versions = await listScheduleVersions(
          client,
          actor,
          demoIds.venueA,
          {},
        )
        expect(versions).toEqual([
          expect.objectContaining({
            effectiveFrom: "2026-09-01",
            effectiveUntil: null,
            id: third.id,
          }),
          expect.objectContaining({
            effectiveFrom: "2026-08-01",
            effectiveUntil: "2026-09-01",
            id: second.id,
          }),
          expect.objectContaining({
            effectiveFrom: "2026-07-01",
            effectiveUntil: "2026-08-01",
            id: first.id,
          }),
        ])
      },
    )
  })

  it("uses a resource override and retains venue fallback for other resources", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const venueSchedule = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          daytimeSchedule,
        )
        const resourceSchedule = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          {
            effectiveFrom: "2026-07-01",
            exceptions: [],
            resourceId: demoIds.resourceA,
            weeklyPeriods: [
              {
                closesAt: "02:00",
                crossesMidnight: true,
                opensAt: "22:00",
                weekday: 5,
              },
            ],
          },
        )

        const preview = await previewFixedSlots(client, actor, demoIds.venueA, {
          offeringId: demoIds.offeringA,
          operationalDate: "2026-07-24",
          resourceId: demoIds.resourceA,
        })
        expect(preview.scheduleScope).toBe("RESOURCE")
        expect(preview.scheduleVersionId).toBe(resourceSchedule.id)
        expect(preview.scheduleVersionId).not.toBe(venueSchedule.id)
        expect(preview.slots).toHaveLength(4)
        expect(preview.slots.at(-1)!.localEnd).toBe("2026-07-25T02:00:00+06:00")
      },
    )
  })

  it("allows a venue-scoped Manager but rejects its unassigned venue", async () => {
    await inRuntimeTransaction(
      staff.manager.authSubject,
      demoIds.businessA,
      async (client, actor) => {
        const schedule = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          daytimeSchedule,
        )
        expect(schedule.venueId).toBe(demoIds.venueA)

        await expect(
          createScheduleVersion(client, actor, demoIds.venueB, daytimeSchedule),
        ).rejects.toMatchObject({ code: "NOT_FOUND" })
      },
    )
  })

  it.each([staff.booking.authSubject, staff.finance.authSubject])(
    "denies schedule mutation for read-only actor %s",
    async (subject) => {
      await inRuntimeTransaction(
        subject,
        demoIds.businessA,
        async (client, actor) => {
          await expect(
            createScheduleVersion(
              client,
              actor,
              demoIds.venueA,
              daytimeSchedule,
            ),
          ).rejects.toBeDefined()
        },
      )
    },
  )

  it("does not enumerate or accept another tenant's schedule relationships", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerB,
      demoIds.businessB,
      async (client, actor) => {
        expect(
          await listScheduleVersions(client, actor, demoIds.venueA, {}),
        ).toEqual([])
        await expect(
          createScheduleVersion(client, actor, demoIds.venueA, daytimeSchedule),
        ).rejects.toMatchObject({ code: "NOT_FOUND" })
        await expect(
          previewFixedSlots(client, actor, demoIds.venueA, {
            offeringId: demoIds.offeringA,
            operationalDate: "2026-07-27",
            resourceId: demoIds.resourceA,
          }),
        ).rejects.toMatchObject({ code: "INCOMPATIBLE_RELATIONSHIP" })
      },
    )
  })

  it("keeps the PostgreSQL overlap guard independent of application validation", async () => {
    await inRuntimeTransaction(
      demoAuthSubjects.ownerA,
      demoIds.businessA,
      async (client, actor) => {
        const schedule = await createScheduleVersion(
          client,
          actor,
          demoIds.venueA,
          daytimeSchedule,
        )

        await client.query(
          `
            INSERT INTO app.weekly_schedule_periods (
              business_id,
              schedule_version_id,
              weekday,
              opens_at,
              closes_at,
              crosses_midnight
            )
            VALUES ($1, $2, 1, '09:00', '11:00', false)
          `,
          [actor.businessId, schedule.id],
        )
        await expect(
          client.query("SET CONSTRAINTS ALL IMMEDIATE"),
        ).rejects.toMatchObject({ code: "23P01" })
      },
    )
  })
})
