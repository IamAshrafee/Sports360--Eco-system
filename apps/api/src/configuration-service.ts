import type {
  Activity,
  ConfigurationListQuery,
  CreateActivity,
  CreateOffering,
  CreateResource,
  Offering,
  Resource,
  ScheduleListQuery,
  ScheduleVersion,
  SlotPreview,
  SlotPreviewQuery,
  UpdateActivity,
  UpdateOffering,
  UpdateResource,
  CreateScheduleVersion,
} from "@sports/contracts"
import { requirePermission, requireVenueAccess } from "@sports/authorization"
import {
  createActivity,
  createOffering,
  createResource,
  createScheduleVersion,
  getOffering,
  listActivities,
  listOfferings,
  listResources,
  listScheduleVersions,
  previewFixedSlots,
  updateActivity,
  updateOffering,
  updateResource,
  withTenantContext,
  type ConfigurationPage,
} from "@sports/persistence"
import type { Pool, PoolClient } from "pg"

export interface ConfigurationCommandContext {
  authSubjectId: string
  businessId: string
  correlationId: string
  sessionVersion: number
}

export interface ConfigurationService {
  createActivity(
    context: ConfigurationCommandContext,
    input: CreateActivity,
  ): Promise<Activity>
  createOffering(
    context: ConfigurationCommandContext,
    venueId: string,
    input: CreateOffering,
  ): Promise<Offering>
  createResource(
    context: ConfigurationCommandContext,
    venueId: string,
    input: CreateResource,
  ): Promise<Resource>
  createScheduleVersion(
    context: ConfigurationCommandContext,
    venueId: string,
    input: CreateScheduleVersion,
  ): Promise<ScheduleVersion>
  getOffering(
    context: ConfigurationCommandContext,
    venueId: string,
    offeringId: string,
  ): Promise<Offering>
  listActivities(
    context: ConfigurationCommandContext,
    query: ConfigurationListQuery,
  ): Promise<ConfigurationPage<Activity>>
  listOfferings(
    context: ConfigurationCommandContext,
    venueId: string,
    query: ConfigurationListQuery,
  ): Promise<ConfigurationPage<Offering>>
  listResources(
    context: ConfigurationCommandContext,
    venueId: string,
    query: ConfigurationListQuery,
  ): Promise<ConfigurationPage<Resource>>
  listScheduleVersions(
    context: ConfigurationCommandContext,
    venueId: string,
    query: ScheduleListQuery,
  ): Promise<ScheduleVersion[]>
  previewFixedSlots(
    context: ConfigurationCommandContext,
    venueId: string,
    query: SlotPreviewQuery,
  ): Promise<SlotPreview>
  updateActivity(
    context: ConfigurationCommandContext,
    activityId: string,
    input: UpdateActivity,
  ): Promise<Activity>
  updateOffering(
    context: ConfigurationCommandContext,
    venueId: string,
    offeringId: string,
    input: UpdateOffering,
  ): Promise<Offering>
  updateResource(
    context: ConfigurationCommandContext,
    venueId: string,
    resourceId: string,
    input: UpdateResource,
  ): Promise<Resource>
}

export function createConfigurationService(pool: Pool): ConfigurationService {
  async function read<Result>(
    context: ConfigurationCommandContext,
    venueId: string | undefined,
    operation: (
      client: PoolClient,
      actor: Parameters<typeof requirePermission>[0],
    ) => Promise<Result>,
  ): Promise<Result> {
    return withTenantContext(pool, context, async (client, actor) => {
      requirePermission(actor, "resource.read")
      if (venueId !== undefined) requireVenueAccess(actor, venueId)
      return operation(client, actor)
    })
  }

  async function write<Result>(
    context: ConfigurationCommandContext,
    venueId: string | undefined,
    operation: (
      client: PoolClient,
      actor: Parameters<typeof requirePermission>[0],
    ) => Promise<Result>,
  ): Promise<Result> {
    return withTenantContext(pool, context, async (client, actor) => {
      requirePermission(actor, "resource.configure")
      if (venueId !== undefined) requireVenueAccess(actor, venueId)
      return operation(client, actor)
    })
  }

  return {
    createActivity: (context, input) =>
      write(context, undefined, (client, actor) =>
        createActivity(client, actor, input),
      ),
    createOffering: (context, venueId, input) =>
      write(context, venueId, (client, actor) =>
        createOffering(client, actor, venueId, input),
      ),
    createResource: (context, venueId, input) =>
      write(context, venueId, (client, actor) =>
        createResource(client, actor, venueId, input),
      ),
    createScheduleVersion: (context, venueId, input) =>
      write(context, venueId, (client, actor) =>
        createScheduleVersion(client, actor, venueId, input),
      ),
    getOffering: (context, venueId, offeringId) =>
      read(context, venueId, (client, actor) =>
        getOffering(client, actor, venueId, offeringId),
      ),
    listActivities: (context, query) =>
      read(context, undefined, (client, actor) =>
        listActivities(client, actor, query),
      ),
    listOfferings: (context, venueId, query) =>
      read(context, venueId, (client, actor) =>
        listOfferings(client, actor, venueId, query),
      ),
    listResources: (context, venueId, query) =>
      read(context, venueId, (client, actor) =>
        listResources(client, actor, venueId, query),
      ),
    listScheduleVersions: (context, venueId, query) =>
      read(context, venueId, (client, actor) =>
        listScheduleVersions(client, actor, venueId, query),
      ),
    previewFixedSlots: (context, venueId, query) =>
      read(context, venueId, (client, actor) =>
        previewFixedSlots(client, actor, venueId, query),
      ),
    updateActivity: (context, activityId, input) =>
      write(context, undefined, (client, actor) =>
        updateActivity(client, actor, activityId, input),
      ),
    updateOffering: (context, venueId, offeringId, input) =>
      write(context, venueId, (client, actor) =>
        updateOffering(client, actor, venueId, offeringId, input),
      ),
    updateResource: (context, venueId, resourceId, input) =>
      write(context, venueId, (client, actor) =>
        updateResource(client, actor, venueId, resourceId, input),
      ),
  }
}
