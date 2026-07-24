import type {
  ActorContext,
  CreateScheduleVersion,
  ScheduleException,
  ScheduleListQuery,
  SchedulePeriod,
  ScheduleVersion,
  SlotPreview,
  SlotPreviewQuery,
  WeeklySchedulePeriod,
} from "@sports/contracts"
import {
  assertIanaTimezone,
  assertScheduleDefinition,
  effectivePeriodsForDate,
  generateFixedSlots,
} from "@sports/domain"
import type { PoolClient } from "pg"

interface ScheduleVersionRow {
  created_at: Date | string
  effective_from: Date | string
  effective_until: Date | string | null
  id: string
  resource_id: string | null
  timezone: string
  venue_id: string
  version: number
}

interface WeeklyPeriodRow {
  closes_at: string
  crosses_midnight: boolean
  opens_at: string
  schedule_version_id: string
  weekday: number
}

interface ExceptionRow {
  exception_kind: ScheduleException["kind"]
  id: string
  local_date: Date | string
  reason: string | null
  schedule_version_id: string
}

interface ExceptionPeriodRow {
  closes_at: string
  crosses_midnight: boolean
  opens_at: string
  schedule_exception_id: string
}

export type ScheduleErrorCode =
  | "DUPLICATE_EFFECTIVE_DATE"
  | "INCOMPATIBLE_RELATIONSHIP"
  | "INVALID_SCHEDULE"
  | "NOT_FOUND"
  | "NO_EFFECTIVE_SCHEDULE"

export class SchedulePersistenceError extends Error {
  override readonly name = "SchedulePersistenceError"

  constructor(
    readonly code: ScheduleErrorCode,
    message: string,
  ) {
    super(message)
  }
}

function isDatabaseError(error: unknown): error is { code?: string } {
  return typeof error === "object" && error !== null && "code" in error
}

function translateDatabaseError(error: unknown): never {
  if (isDatabaseError(error)) {
    if (error.code === "23505") {
      throw new SchedulePersistenceError(
        "DUPLICATE_EFFECTIVE_DATE",
        "A schedule version already begins on that date.",
      )
    }
    if (error.code === "23P01" || error.code === "23514") {
      throw new SchedulePersistenceError(
        "INVALID_SCHEDULE",
        "The schedule periods or effective dates are invalid.",
      )
    }
    if (error.code === "23503" || error.code === "42501") {
      throw new SchedulePersistenceError(
        "INCOMPATIBLE_RELATIONSHIP",
        "The schedule scope is unavailable or incompatible.",
      )
    }
  }

  throw error
}

function localDate(value: Date | string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value.slice(0, 10)
}

function timestamp(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString()
}

function localTime(value: string): string {
  return value.slice(0, 5)
}

function toPeriod(row: {
  closes_at: string
  crosses_midnight: boolean
  opens_at: string
}): SchedulePeriod {
  return {
    closesAt: localTime(row.closes_at),
    crossesMidnight: row.crosses_midnight,
    opensAt: localTime(row.opens_at),
  }
}

async function hydrateSchedules(
  client: PoolClient,
  rows: ScheduleVersionRow[],
): Promise<ScheduleVersion[]> {
  if (rows.length === 0) return []
  const ids = rows.map(({ id }) => id)
  const [weeklyResult, exceptionResult] = await Promise.all([
    client.query<WeeklyPeriodRow>(
      `
        SELECT
          schedule_version_id,
          weekday,
          opens_at::text,
          closes_at::text,
          crosses_midnight
        FROM app.weekly_schedule_periods
        WHERE schedule_version_id = ANY($1::uuid[])
        ORDER BY schedule_version_id, weekday, opens_at, id
      `,
      [ids],
    ),
    client.query<ExceptionRow>(
      `
        SELECT
          id,
          schedule_version_id,
          local_date::text AS local_date,
          exception_kind,
          reason
        FROM app.schedule_exceptions
        WHERE schedule_version_id = ANY($1::uuid[])
        ORDER BY schedule_version_id, local_date, id
      `,
      [ids],
    ),
  ])

  const exceptionIds = exceptionResult.rows.map(({ id }) => id)
  const exceptionPeriodResult =
    exceptionIds.length === 0
      ? { rows: [] as ExceptionPeriodRow[] }
      : await client.query<ExceptionPeriodRow>(
          `
            SELECT
              schedule_exception_id,
              opens_at::text,
              closes_at::text,
              crosses_midnight
            FROM app.schedule_exception_periods
            WHERE schedule_exception_id = ANY($1::uuid[])
            ORDER BY schedule_exception_id, opens_at, id
          `,
          [exceptionIds],
        )

  const weeklyBySchedule = new Map<string, WeeklySchedulePeriod[]>()
  for (const period of weeklyResult.rows) {
    const periods = weeklyBySchedule.get(period.schedule_version_id) ?? []
    periods.push({ ...toPeriod(period), weekday: period.weekday })
    weeklyBySchedule.set(period.schedule_version_id, periods)
  }

  const exceptionPeriods = new Map<string, SchedulePeriod[]>()
  for (const period of exceptionPeriodResult.rows) {
    const periods = exceptionPeriods.get(period.schedule_exception_id) ?? []
    periods.push(toPeriod(period))
    exceptionPeriods.set(period.schedule_exception_id, periods)
  }

  const exceptionsBySchedule = new Map<string, ScheduleException[]>()
  for (const exception of exceptionResult.rows) {
    const exceptions =
      exceptionsBySchedule.get(exception.schedule_version_id) ?? []
    const mapped: ScheduleException = {
      kind: exception.exception_kind,
      localDate: localDate(exception.local_date),
      periods: exceptionPeriods.get(exception.id) ?? [],
      ...(exception.reason === null ? {} : { reason: exception.reason }),
    }
    exceptions.push(mapped)
    exceptionsBySchedule.set(exception.schedule_version_id, exceptions)
  }

  return rows.map((row) => ({
    createdAt: timestamp(row.created_at),
    effectiveFrom: localDate(row.effective_from),
    effectiveUntil:
      row.effective_until === null ? null : localDate(row.effective_until),
    exceptions: exceptionsBySchedule.get(row.id) ?? [],
    id: row.id,
    resourceId: row.resource_id,
    scope: row.resource_id === null ? "VENUE" : "RESOURCE",
    timezone: row.timezone,
    venueId: row.venue_id,
    version: row.version,
    weeklyPeriods: weeklyBySchedule.get(row.id) ?? [],
  }))
}

async function getScheduleById(
  client: PoolClient,
  businessId: string,
  scheduleVersionId: string,
): Promise<ScheduleVersion> {
  const result = await client.query<ScheduleVersionRow>(
    `
      SELECT
        id,
        venue_id,
        resource_id,
        timezone,
        effective_from::text AS effective_from,
        effective_until::text AS effective_until,
        version,
        created_at
      FROM app.schedule_versions
      WHERE business_id = $1 AND id = $2
    `,
    [businessId, scheduleVersionId],
  )
  const schedules = await hydrateSchedules(client, result.rows)
  const schedule = schedules[0]
  if (schedule === undefined) {
    throw new SchedulePersistenceError(
      "NOT_FOUND",
      "The requested schedule was not found.",
    )
  }
  return schedule
}

async function audit(
  client: PoolClient,
  schedule: ScheduleVersion,
): Promise<void> {
  await client.query(
    `
      SELECT app.record_audit_entry(
        $1, $2, $3, NULL, $4::jsonb, '{}'::jsonb
      )
    `,
    [
      "configuration.schedule.created",
      "schedule_version",
      schedule.id,
      JSON.stringify({
        effectiveFrom: schedule.effectiveFrom,
        effectiveUntil: schedule.effectiveUntil,
        exceptionCount: schedule.exceptions.length,
        resourceId: schedule.resourceId,
        scope: schedule.scope,
        timezone: schedule.timezone,
        venueId: schedule.venueId,
        version: schedule.version,
        weeklyPeriodCount: schedule.weeklyPeriods.length,
      }),
    ],
  )
}

export async function listScheduleVersions(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  query: ScheduleListQuery,
): Promise<ScheduleVersion[]> {
  const result = await client.query<ScheduleVersionRow>(
    `
      SELECT
        id,
        venue_id,
        resource_id,
        timezone,
        effective_from::text AS effective_from,
        effective_until::text AS effective_until,
        version,
        created_at
      FROM app.schedule_versions
      WHERE business_id = $1
        AND venue_id = $2
        AND ($3::uuid IS NULL OR resource_id = $3)
      ORDER BY effective_from DESC, version DESC, id DESC
      LIMIT 100
    `,
    [actor.businessId, venueId, query.resourceId ?? null],
  )
  return hydrateSchedules(client, result.rows)
}

export async function createScheduleVersion(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  input: CreateScheduleVersion,
): Promise<ScheduleVersion> {
  assertScheduleDefinition(input.weeklyPeriods, input.exceptions)

  try {
    const venueResult = await client.query<{ timezone: string }>(
      `
        SELECT timezone
        FROM app.venues
        WHERE business_id = $1 AND id = $2
      `,
      [actor.businessId, venueId],
    )
    const venue = venueResult.rows[0]
    if (venue === undefined) {
      throw new SchedulePersistenceError(
        "NOT_FOUND",
        "The requested schedule scope was not found.",
      )
    }
    assertIanaTimezone(venue.timezone)

    if (input.resourceId !== undefined) {
      const resource = await client.query(
        `
          SELECT id
          FROM app.resources
          WHERE business_id = $1 AND venue_id = $2 AND id = $3
        `,
        [actor.businessId, venueId, input.resourceId],
      )
      if (resource.rowCount !== 1) {
        throw new SchedulePersistenceError(
          "NOT_FOUND",
          "The requested schedule scope was not found.",
        )
      }
    }

    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtextextended($1 || ':' || $2 || ':' || coalesce($3, 'venue'), 0)
        )
      `,
      [actor.businessId, venueId, input.resourceId ?? null],
    )

    const existing = await client.query<{
      effective_from: Date | string
      id: string
      version: number
    }>(
      `
        SELECT id, effective_from::text AS effective_from, version
        FROM app.schedule_versions
        WHERE business_id = $1
          AND venue_id = $2
          AND resource_id IS NOT DISTINCT FROM $3::uuid
        ORDER BY effective_from, id
      `,
      [actor.businessId, venueId, input.resourceId ?? null],
    )

    if (
      existing.rows.some(
        ({ effective_from }) =>
          localDate(effective_from) === input.effectiveFrom,
      )
    ) {
      throw new SchedulePersistenceError(
        "DUPLICATE_EFFECTIVE_DATE",
        "A schedule version already begins on that date.",
      )
    }

    const prior = existing.rows
      .filter(
        ({ effective_from }) => localDate(effective_from) < input.effectiveFrom,
      )
      .at(-1)
    const next = existing.rows.find(
      ({ effective_from }) => localDate(effective_from) > input.effectiveFrom,
    )
    const version =
      Math.max(0, ...existing.rows.map((schedule) => schedule.version)) + 1

    if (prior !== undefined) {
      await client.query(
        `
          UPDATE app.schedule_versions
          SET effective_until = $1
          WHERE business_id = $2 AND id = $3
        `,
        [input.effectiveFrom, actor.businessId, prior.id],
      )
    }

    const inserted = await client.query<{ id: string }>(
      `
        INSERT INTO app.schedule_versions (
          business_id,
          venue_id,
          resource_id,
          timezone,
          effective_from,
          effective_until,
          version
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        actor.businessId,
        venueId,
        input.resourceId ?? null,
        venue.timezone,
        input.effectiveFrom,
        next === undefined ? null : localDate(next.effective_from),
        version,
      ],
    )
    const scheduleVersionId = inserted.rows[0]!.id

    for (const period of input.weeklyPeriods) {
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
          VALUES ($1, $2, $3, $4::time, $5::time, $6)
        `,
        [
          actor.businessId,
          scheduleVersionId,
          period.weekday,
          period.opensAt,
          period.closesAt,
          period.crossesMidnight,
        ],
      )
    }

    for (const exception of input.exceptions) {
      const insertedException = await client.query<{ id: string }>(
        `
          INSERT INTO app.schedule_exceptions (
            business_id,
            schedule_version_id,
            local_date,
            exception_kind,
            reason
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [
          actor.businessId,
          scheduleVersionId,
          exception.localDate,
          exception.kind,
          exception.reason ?? null,
        ],
      )
      const exceptionId = insertedException.rows[0]!.id
      for (const period of exception.periods) {
        await client.query(
          `
            INSERT INTO app.schedule_exception_periods (
              business_id,
              schedule_exception_id,
              opens_at,
              closes_at,
              crosses_midnight
            )
            VALUES ($1, $2, $3::time, $4::time, $5)
          `,
          [
            actor.businessId,
            exceptionId,
            period.opensAt,
            period.closesAt,
            period.crossesMidnight,
          ],
        )
      }
    }

    const schedule = await getScheduleById(
      client,
      actor.businessId,
      scheduleVersionId,
    )
    await audit(client, schedule)
    return schedule
  } catch (error) {
    if (error instanceof SchedulePersistenceError) throw error
    translateDatabaseError(error)
  }
}

async function effectiveSchedule(
  client: PoolClient,
  businessId: string,
  venueId: string,
  resourceId: string,
  operationalDate: string,
): Promise<ScheduleVersion> {
  const result = await client.query<ScheduleVersionRow>(
    `
      SELECT
        id,
        venue_id,
        resource_id,
        timezone,
        effective_from::text AS effective_from,
        effective_until::text AS effective_until,
        version,
        created_at
      FROM app.schedule_versions
      WHERE business_id = $1
        AND venue_id = $2
        AND resource_id = $3
        AND effective_from <= $4
        AND (effective_until IS NULL OR $4 < effective_until)
      UNION ALL
      SELECT
        id,
        venue_id,
        resource_id,
        timezone,
        effective_from::text AS effective_from,
        effective_until::text AS effective_until,
        version,
        created_at
      FROM app.schedule_versions
      WHERE business_id = $1
        AND venue_id = $2
        AND resource_id IS NULL
        AND effective_from <= $4
        AND (effective_until IS NULL OR $4 < effective_until)
      ORDER BY resource_id NULLS LAST
      LIMIT 1
    `,
    [businessId, venueId, resourceId, operationalDate],
  )
  const schedules = await hydrateSchedules(client, result.rows)
  const schedule = schedules[0]
  if (schedule === undefined) {
    throw new SchedulePersistenceError(
      "NO_EFFECTIVE_SCHEDULE",
      "No venue or resource schedule is effective for that date.",
    )
  }
  return schedule
}

export async function previewFixedSlots(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  query: SlotPreviewQuery,
): Promise<SlotPreview> {
  const compatibility = await client.query<{ duration_minutes: number }>(
    `
      SELECT offerings.duration_minutes
      FROM app.offerings offerings
      JOIN app.offering_resources compatibility
        ON compatibility.business_id = offerings.business_id
        AND compatibility.venue_id = offerings.venue_id
        AND compatibility.offering_id = offerings.id
      JOIN app.resources resources
        ON resources.business_id = compatibility.business_id
        AND resources.venue_id = compatibility.venue_id
        AND resources.id = compatibility.resource_id
      WHERE offerings.business_id = $1
        AND offerings.venue_id = $2
        AND offerings.id = $3
        AND compatibility.resource_id = $4
        AND resources.activity_id = offerings.activity_id
    `,
    [actor.businessId, venueId, query.offeringId, query.resourceId],
  )
  const offering = compatibility.rows[0]
  if (offering === undefined) {
    throw new SchedulePersistenceError(
      "INCOMPATIBLE_RELATIONSHIP",
      "The selected offering and resource are unavailable or incompatible.",
    )
  }

  const schedule = await effectiveSchedule(
    client,
    actor.businessId,
    venueId,
    query.resourceId,
    query.operationalDate,
  )
  const periods = effectivePeriodsForDate(
    query.operationalDate,
    schedule.weeklyPeriods,
    schedule.exceptions,
  )
  const slots = generateFixedSlots({
    durationMinutes: offering.duration_minutes,
    operationalDate: query.operationalDate,
    periods,
    timezone: schedule.timezone,
  })

  return {
    offeringDurationMinutes: offering.duration_minutes,
    operationalDate: query.operationalDate,
    scheduleScope: schedule.scope,
    scheduleVersionId: schedule.id,
    slots,
    timezone: schedule.timezone,
  }
}
