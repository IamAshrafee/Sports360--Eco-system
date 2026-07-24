import type {
  Activity,
  ActorContext,
  ConfigurationListQuery,
  CreateActivity,
  CreateOffering,
  CreateResource,
  Offering,
  Resource,
  UpdateActivity,
  UpdateOffering,
  UpdateResource,
} from "@sports/contracts"
import {
  assertOfferingDuration,
  normalizeActivityCode,
  uniqueResourceIds,
} from "@sports/domain"
import type { PoolClient } from "pg"

interface ActivityRow {
  code: string
  created_at: Date | string
  display_name: string
  id: string
  state: Activity["state"]
  updated_at: Date | string
  version: number
}

interface ResourceRow {
  activity_id: string
  created_at: Date | string
  id: string
  name: string
  state: Resource["state"]
  updated_at: Date | string
  venue_id: string
  version: number
}

interface OfferingRow {
  activity_id: string
  created_at: Date | string
  duration_minutes: number
  id: string
  name: string
  resource_ids: string[]
  state: Offering["state"]
  updated_at: Date | string
  venue_id: string
  version: number
}

export interface ConfigurationPage<Item> {
  items: Item[]
  nextCursor: string | null
}

export type ConfigurationErrorCode =
  | "DUPLICATE_CONFIGURATION"
  | "INCOMPATIBLE_RELATIONSHIP"
  | "NOT_FOUND"
  | "STALE_VERSION"

export class ConfigurationPersistenceError extends Error {
  override readonly name = "ConfigurationPersistenceError"

  constructor(
    readonly code: ConfigurationErrorCode,
    message: string,
  ) {
    super(message)
  }
}

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString()
}

function toActivity(row: ActivityRow): Activity {
  return {
    code: row.code,
    createdAt: iso(row.created_at),
    displayName: row.display_name,
    id: row.id,
    state: row.state,
    updatedAt: iso(row.updated_at),
    version: row.version,
  }
}

function toResource(row: ResourceRow): Resource {
  return {
    activityId: row.activity_id,
    createdAt: iso(row.created_at),
    id: row.id,
    name: row.name,
    state: row.state,
    updatedAt: iso(row.updated_at),
    venueId: row.venue_id,
    version: row.version,
  }
}

function toOffering(row: OfferingRow): Offering {
  return {
    activityId: row.activity_id,
    createdAt: iso(row.created_at),
    durationMinutes: row.duration_minutes,
    id: row.id,
    name: row.name,
    resourceIds: row.resource_ids,
    state: row.state,
    updatedAt: iso(row.updated_at),
    venueId: row.venue_id,
    version: row.version,
  }
}

function page<Item extends { id: string }>(
  items: Item[],
  limit: number,
): ConfigurationPage<Item> {
  const hasMore = items.length > limit
  const visible = hasMore ? items.slice(0, limit) : items

  return {
    items: visible,
    nextCursor: hasMore ? (visible.at(-1)?.id ?? null) : null,
  }
}

function isDatabaseError(error: unknown): error is { code?: string } {
  return typeof error === "object" && error !== null && "code" in error
}

function translateDatabaseError(error: unknown): never {
  if (isDatabaseError(error)) {
    if (error.code === "23505") {
      throw new ConfigurationPersistenceError(
        "DUPLICATE_CONFIGURATION",
        "An equivalent configuration already exists.",
      )
    }

    if (
      error.code === "23503" ||
      error.code === "23514" ||
      error.code === "42501"
    ) {
      throw new ConfigurationPersistenceError(
        "INCOMPATIBLE_RELATIONSHIP",
        "The selected configuration is unavailable or incompatible.",
      )
    }
  }

  throw error
}

async function audit(
  client: PoolClient,
  action: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown,
): Promise<void> {
  await client.query(
    `
      SELECT app.record_audit_entry(
        $1, $2, $3, $4::jsonb, $5::jsonb, '{}'::jsonb
      )
    `,
    [
      action,
      entityType,
      entityId,
      before === null ? null : JSON.stringify(before),
      JSON.stringify(after),
    ],
  )
}

async function activityById(
  client: PoolClient,
  businessId: string,
  activityId: string,
): Promise<ActivityRow | undefined> {
  const result = await client.query<ActivityRow>(
    `
      SELECT id, code, display_name, state, version, created_at, updated_at
      FROM app.activities
      WHERE business_id = $1 AND id = $2
    `,
    [businessId, activityId],
  )
  return result.rows[0]
}

async function resourceById(
  client: PoolClient,
  businessId: string,
  venueId: string,
  resourceId: string,
): Promise<ResourceRow | undefined> {
  const result = await client.query<ResourceRow>(
    `
      SELECT
        id, venue_id, activity_id, name, state, version, created_at, updated_at
      FROM app.resources
      WHERE business_id = $1 AND venue_id = $2 AND id = $3
    `,
    [businessId, venueId, resourceId],
  )
  return result.rows[0]
}

async function offeringById(
  client: PoolClient,
  businessId: string,
  venueId: string,
  offeringId: string,
): Promise<OfferingRow | undefined> {
  const result = await client.query<OfferingRow>(
    `
      SELECT
        offerings.id,
        offerings.venue_id,
        offerings.activity_id,
        offerings.name,
        offerings.duration_minutes,
        offerings.state,
        offerings.version,
        offerings.created_at,
        offerings.updated_at,
        coalesce(
          array_agg(compatibility.resource_id ORDER BY compatibility.resource_id)
            FILTER (WHERE compatibility.resource_id IS NOT NULL),
          ARRAY[]::uuid[]
        )::text[] AS resource_ids
      FROM app.offerings offerings
      LEFT JOIN app.offering_resources compatibility
        ON compatibility.business_id = offerings.business_id
        AND compatibility.offering_id = offerings.id
      WHERE offerings.business_id = $1
        AND offerings.venue_id = $2
        AND offerings.id = $3
      GROUP BY offerings.id
    `,
    [businessId, venueId, offeringId],
  )
  return result.rows[0]
}

async function requireCompatibleResources(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  activityId: string,
  resourceIds: readonly string[],
  requireActive: boolean,
): Promise<string[]> {
  const uniqueIds = uniqueResourceIds(resourceIds)
  const result = await client.query<{ id: string; state: string }>(
    `
      SELECT id, state
      FROM app.resources
      WHERE business_id = $1
        AND venue_id = $2
        AND activity_id = $3
        AND id = ANY($4::uuid[])
      ORDER BY id
    `,
    [actor.businessId, venueId, activityId, uniqueIds],
  )

  if (
    result.rows.length !== uniqueIds.length ||
    (requireActive && result.rows.some(({ state }) => state !== "ACTIVE"))
  ) {
    throw new ConfigurationPersistenceError(
      "INCOMPATIBLE_RELATIONSHIP",
      "Every selected resource must belong to this venue and activity, and active offerings require active resources.",
    )
  }

  return uniqueIds
}

export async function listActivities(
  client: PoolClient,
  actor: ActorContext,
  query: ConfigurationListQuery,
): Promise<ConfigurationPage<Activity>> {
  const result = await client.query<ActivityRow>(
    `
      SELECT id, code, display_name, state, version, created_at, updated_at
      FROM app.activities
      WHERE business_id = $1
        AND ($2::uuid IS NULL OR id > $2)
      ORDER BY id
      LIMIT $3
    `,
    [actor.businessId, query.cursor ?? null, query.limit + 1],
  )

  return page(result.rows.map(toActivity), query.limit)
}

export async function createActivity(
  client: PoolClient,
  actor: ActorContext,
  input: CreateActivity,
): Promise<Activity> {
  try {
    const result = await client.query<ActivityRow>(
      `
        INSERT INTO app.activities (
          business_id, code, display_name, state
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id, code, display_name, state, version, created_at, updated_at
      `,
      [
        actor.businessId,
        normalizeActivityCode(input.code),
        input.displayName.trim(),
        input.state,
      ],
    )
    const activity = toActivity(result.rows[0]!)
    await audit(
      client,
      "configuration.activity.created",
      "activity",
      activity.id,
      null,
      activity,
    )
    return activity
  } catch (error) {
    translateDatabaseError(error)
  }
}

export async function updateActivity(
  client: PoolClient,
  actor: ActorContext,
  activityId: string,
  input: UpdateActivity,
): Promise<Activity> {
  const existingRow = await activityById(client, actor.businessId, activityId)
  if (existingRow === undefined) {
    throw new ConfigurationPersistenceError(
      "NOT_FOUND",
      "The requested configuration was not found.",
    )
  }
  const existing = toActivity(existingRow)

  try {
    const result = await client.query<ActivityRow>(
      `
        UPDATE app.activities
        SET
          display_name = $3,
          state = $4,
          version = version + 1,
          updated_at = clock_timestamp()
        WHERE business_id = $1
          AND id = $2
          AND version = $5
        RETURNING
          id, code, display_name, state, version, created_at, updated_at
      `,
      [
        actor.businessId,
        activityId,
        input.displayName?.trim() ?? existing.displayName,
        input.state ?? existing.state,
        input.expectedVersion,
      ],
    )
    const row = result.rows[0]
    if (row === undefined) {
      throw new ConfigurationPersistenceError(
        "STALE_VERSION",
        "This activity changed after it was loaded.",
      )
    }
    const activity = toActivity(row)
    await audit(
      client,
      "configuration.activity.updated",
      "activity",
      activity.id,
      existing,
      activity,
    )
    return activity
  } catch (error) {
    if (error instanceof ConfigurationPersistenceError) throw error
    translateDatabaseError(error)
  }
}

export async function listResources(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  query: ConfigurationListQuery,
): Promise<ConfigurationPage<Resource>> {
  const result = await client.query<ResourceRow>(
    `
      SELECT
        id, venue_id, activity_id, name, state, version, created_at, updated_at
      FROM app.resources
      WHERE business_id = $1
        AND venue_id = $2
        AND ($3::uuid IS NULL OR id > $3)
      ORDER BY id
      LIMIT $4
    `,
    [actor.businessId, venueId, query.cursor ?? null, query.limit + 1],
  )

  return page(result.rows.map(toResource), query.limit)
}

export async function createResource(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  input: CreateResource,
): Promise<Resource> {
  const activity = await activityById(
    client,
    actor.businessId,
    input.activityId,
  )
  if (
    activity === undefined ||
    (input.state === "ACTIVE" && activity.state !== "ACTIVE")
  ) {
    throw new ConfigurationPersistenceError(
      "INCOMPATIBLE_RELATIONSHIP",
      "The selected activity is unavailable for this resource.",
    )
  }

  try {
    const result = await client.query<ResourceRow>(
      `
        INSERT INTO app.resources (
          business_id, venue_id, activity_id, activity_code,
          name, capacity, state
        )
        VALUES ($1, $2, $3, $4, $5, 1, $6)
        RETURNING
          id, venue_id, activity_id, name, state, version,
          created_at, updated_at
      `,
      [
        actor.businessId,
        venueId,
        input.activityId,
        activity.code.replaceAll("-", "_"),
        input.name.trim(),
        input.state,
      ],
    )
    const resource = toResource(result.rows[0]!)
    await client.query(
      `
        INSERT INTO app.resource_units (
          business_id, resource_id, unit_number
        )
        VALUES ($1, $2, 1)
      `,
      [actor.businessId, resource.id],
    )
    await audit(
      client,
      "configuration.resource.created",
      "resource",
      resource.id,
      null,
      resource,
    )
    return resource
  } catch (error) {
    translateDatabaseError(error)
  }
}

export async function updateResource(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  resourceId: string,
  input: UpdateResource,
): Promise<Resource> {
  const existingRow = await resourceById(
    client,
    actor.businessId,
    venueId,
    resourceId,
  )
  if (existingRow === undefined) {
    throw new ConfigurationPersistenceError(
      "NOT_FOUND",
      "The requested configuration was not found.",
    )
  }
  const existing = toResource(existingRow)
  const activityId = input.activityId ?? existing.activityId
  const activity = await activityById(client, actor.businessId, activityId)
  const state = input.state ?? existing.state

  if (
    activity === undefined ||
    (state === "ACTIVE" && activity.state !== "ACTIVE")
  ) {
    throw new ConfigurationPersistenceError(
      "INCOMPATIBLE_RELATIONSHIP",
      "The selected activity is unavailable for this resource.",
    )
  }

  try {
    const result = await client.query<ResourceRow>(
      `
        UPDATE app.resources
        SET
          activity_id = $4,
          activity_code = $5,
          name = $6,
          state = $7,
          version = version + 1,
          updated_at = clock_timestamp()
        WHERE business_id = $1
          AND venue_id = $2
          AND id = $3
          AND version = $8
        RETURNING
          id, venue_id, activity_id, name, state, version,
          created_at, updated_at
      `,
      [
        actor.businessId,
        venueId,
        resourceId,
        activityId,
        activity.code.replaceAll("-", "_"),
        input.name?.trim() ?? existing.name,
        state,
        input.expectedVersion,
      ],
    )
    const row = result.rows[0]
    if (row === undefined) {
      throw new ConfigurationPersistenceError(
        "STALE_VERSION",
        "This resource changed after it was loaded.",
      )
    }
    const resource = toResource(row)
    await audit(
      client,
      "configuration.resource.updated",
      "resource",
      resource.id,
      existing,
      resource,
    )
    return resource
  } catch (error) {
    if (error instanceof ConfigurationPersistenceError) throw error
    translateDatabaseError(error)
  }
}

export async function listOfferings(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  query: ConfigurationListQuery,
): Promise<ConfigurationPage<Offering>> {
  const result = await client.query<OfferingRow>(
    `
      SELECT
        offerings.id,
        offerings.venue_id,
        offerings.activity_id,
        offerings.name,
        offerings.duration_minutes,
        offerings.state,
        offerings.version,
        offerings.created_at,
        offerings.updated_at,
        coalesce(
          array_agg(compatibility.resource_id ORDER BY compatibility.resource_id)
            FILTER (WHERE compatibility.resource_id IS NOT NULL),
          ARRAY[]::uuid[]
        )::text[] AS resource_ids
      FROM app.offerings offerings
      LEFT JOIN app.offering_resources compatibility
        ON compatibility.business_id = offerings.business_id
        AND compatibility.offering_id = offerings.id
      WHERE offerings.business_id = $1
        AND offerings.venue_id = $2
        AND ($3::uuid IS NULL OR offerings.id > $3)
      GROUP BY offerings.id
      ORDER BY offerings.id
      LIMIT $4
    `,
    [actor.businessId, venueId, query.cursor ?? null, query.limit + 1],
  )

  return page(result.rows.map(toOffering), query.limit)
}

export async function getOffering(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  offeringId: string,
): Promise<Offering> {
  const row = await offeringById(client, actor.businessId, venueId, offeringId)
  if (row === undefined) {
    throw new ConfigurationPersistenceError(
      "NOT_FOUND",
      "The requested configuration was not found.",
    )
  }
  return toOffering(row)
}

async function replaceOfferingResources(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  offeringId: string,
  activityId: string,
  resourceIds: readonly string[],
): Promise<void> {
  await client.query(
    `
      DELETE FROM app.offering_resources
      WHERE business_id = $1 AND offering_id = $2
    `,
    [actor.businessId, offeringId],
  )
  await client.query(
    `
      INSERT INTO app.offering_resources (
        business_id, venue_id, offering_id, resource_id, activity_id
      )
      SELECT $1, $2, $3, resources.id, $4
      FROM unnest($5::uuid[]) AS resources(id)
    `,
    [actor.businessId, venueId, offeringId, activityId, resourceIds],
  )
}

export async function createOffering(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  input: CreateOffering,
): Promise<Offering> {
  assertOfferingDuration(input.durationMinutes)
  const activity = await activityById(
    client,
    actor.businessId,
    input.activityId,
  )
  if (
    activity === undefined ||
    (input.state === "ACTIVE" && activity.state !== "ACTIVE")
  ) {
    throw new ConfigurationPersistenceError(
      "INCOMPATIBLE_RELATIONSHIP",
      "The selected activity is unavailable for this offering.",
    )
  }
  const resourceIds = await requireCompatibleResources(
    client,
    actor,
    venueId,
    input.activityId,
    input.resourceIds,
    input.state === "ACTIVE",
  )

  try {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO app.offerings (
          business_id, venue_id, activity_id, name, duration_minutes, state
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [
        actor.businessId,
        venueId,
        input.activityId,
        input.name.trim(),
        input.durationMinutes,
        input.state,
      ],
    )
    const offeringId = result.rows[0]!.id
    await replaceOfferingResources(
      client,
      actor,
      venueId,
      offeringId,
      input.activityId,
      resourceIds,
    )
    const offering = await getOffering(client, actor, venueId, offeringId)
    await audit(
      client,
      "configuration.offering.created",
      "offering",
      offering.id,
      null,
      offering,
    )
    return offering
  } catch (error) {
    if (error instanceof ConfigurationPersistenceError) throw error
    translateDatabaseError(error)
  }
}

export async function updateOffering(
  client: PoolClient,
  actor: ActorContext,
  venueId: string,
  offeringId: string,
  input: UpdateOffering,
): Promise<Offering> {
  const existing = await getOffering(client, actor, venueId, offeringId)
  const activityId = input.activityId ?? existing.activityId
  const durationMinutes = input.durationMinutes ?? existing.durationMinutes
  const resourceIds = input.resourceIds ?? existing.resourceIds
  const state = input.state ?? existing.state
  assertOfferingDuration(durationMinutes)

  const activity = await activityById(client, actor.businessId, activityId)
  if (
    activity === undefined ||
    (state === "ACTIVE" && activity.state !== "ACTIVE")
  ) {
    throw new ConfigurationPersistenceError(
      "INCOMPATIBLE_RELATIONSHIP",
      "The selected activity is unavailable for this offering.",
    )
  }
  const compatibleIds = await requireCompatibleResources(
    client,
    actor,
    venueId,
    activityId,
    resourceIds,
    state === "ACTIVE",
  )

  try {
    const result = await client.query<{ id: string }>(
      `
        UPDATE app.offerings
        SET
          activity_id = $4,
          name = $5,
          duration_minutes = $6,
          state = $7,
          version = version + 1,
          updated_at = clock_timestamp()
        WHERE business_id = $1
          AND venue_id = $2
          AND id = $3
          AND version = $8
        RETURNING id
      `,
      [
        actor.businessId,
        venueId,
        offeringId,
        activityId,
        input.name?.trim() ?? existing.name,
        durationMinutes,
        state,
        input.expectedVersion,
      ],
    )
    if (result.rows[0] === undefined) {
      throw new ConfigurationPersistenceError(
        "STALE_VERSION",
        "This offering changed after it was loaded.",
      )
    }
    await replaceOfferingResources(
      client,
      actor,
      venueId,
      offeringId,
      activityId,
      compatibleIds,
    )
    const offering = await getOffering(client, actor, venueId, offeringId)
    await audit(
      client,
      "configuration.offering.updated",
      "offering",
      offering.id,
      existing,
      offering,
    )
    return offering
  } catch (error) {
    if (error instanceof ConfigurationPersistenceError) throw error
    translateDatabaseError(error)
  }
}
