import {
  createActivity,
  createOffering,
  createResource,
  createScheduleVersion,
  listActivities,
  listOfferings,
  listResources,
  listScheduleVersions,
  previewFixedSlots,
  updateActivity,
  updateOffering,
  updateResource,
  type ListActivitiesResponse,
  type ListOfferingsResponse,
  type ListResourcesResponse,
  type CreateScheduleVersionData,
  type ListScheduleVersionsResponse,
  type PreviewFixedSlotsResponse,
} from "@sports/api-client"

export type Activity = ListActivitiesResponse["items"][number]
export type Offering = ListOfferingsResponse["items"][number]
export type Resource = ListResourcesResponse["items"][number]
export type ScheduleVersion = ListScheduleVersionsResponse["items"][number]
export type SlotPreview = PreviewFixedSlotsResponse["preview"]
export type CreateScheduleVersionInput = CreateScheduleVersionData["body"]

export class ConfigurationApiError extends Error {
  override readonly name = "ConfigurationApiError"

  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

function requestOptions(businessId: string) {
  return {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    credentials: "include" as const,
    headers: { "x-business-id": businessId },
  }
}

function throwApiError(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  ) {
    throw new ConfigurationApiError(error.code, error.message)
  }

  throw new ConfigurationApiError(
    "NETWORK_ERROR",
    "The configuration service could not be reached.",
  )
}

export async function loadResourceSetup(
  businessId: string,
  venueId: string,
): Promise<{ activities: Activity[]; resources: Resource[] }> {
  const options = requestOptions(businessId)
  const [activityResult, resourceResult] = await Promise.all([
    listActivities({ ...options, query: { limit: 100 } }),
    listResources({
      ...options,
      path: { venueId },
      query: { limit: 100 },
    }),
  ])

  if (activityResult.error !== undefined) throwApiError(activityResult.error)
  if (resourceResult.error !== undefined) throwApiError(resourceResult.error)

  return {
    activities: activityResult.data.items,
    resources: resourceResult.data.items,
  }
}

export async function loadOfferingSetup(
  businessId: string,
  venueId: string,
): Promise<{
  activities: Activity[]
  offerings: Offering[]
  resources: Resource[]
}> {
  const options = requestOptions(businessId)
  const [activityResult, resourceResult, offeringResult] = await Promise.all([
    listActivities({ ...options, query: { limit: 100 } }),
    listResources({
      ...options,
      path: { venueId },
      query: { limit: 100 },
    }),
    listOfferings({
      ...options,
      path: { venueId },
      query: { limit: 100 },
    }),
  ])

  if (activityResult.error !== undefined) throwApiError(activityResult.error)
  if (resourceResult.error !== undefined) throwApiError(resourceResult.error)
  if (offeringResult.error !== undefined) throwApiError(offeringResult.error)

  return {
    activities: activityResult.data.items,
    offerings: offeringResult.data.items,
    resources: resourceResult.data.items,
  }
}

export async function loadScheduleSetup(
  businessId: string,
  venueId: string,
): Promise<{
  offerings: Offering[]
  resources: Resource[]
  schedules: ScheduleVersion[]
}> {
  const options = requestOptions(businessId)
  const [resourceResult, offeringResult, scheduleResult] = await Promise.all([
    listResources({
      ...options,
      path: { venueId },
      query: { limit: 100 },
    }),
    listOfferings({
      ...options,
      path: { venueId },
      query: { limit: 100 },
    }),
    listScheduleVersions({
      ...options,
      path: { venueId },
    }),
  ])

  if (resourceResult.error !== undefined) throwApiError(resourceResult.error)
  if (offeringResult.error !== undefined) throwApiError(offeringResult.error)
  if (scheduleResult.error !== undefined) throwApiError(scheduleResult.error)

  return {
    offerings: offeringResult.data.items,
    resources: resourceResult.data.items,
    schedules: scheduleResult.data.items,
  }
}

export async function addActivity(
  businessId: string,
  input: { code: string; displayName: string },
): Promise<Activity> {
  const result = await createActivity({
    ...requestOptions(businessId),
    body: input,
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.activity
}

export async function changeActivity(
  businessId: string,
  activity: Activity,
  state: Activity["state"],
): Promise<Activity> {
  const result = await updateActivity({
    ...requestOptions(businessId),
    body: { expectedVersion: activity.version, state },
    path: { activityId: activity.id },
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.activity
}

export async function addResource(
  businessId: string,
  venueId: string,
  input: {
    activityId: string
    name: string
    state: Resource["state"]
  },
): Promise<Resource> {
  const result = await createResource({
    ...requestOptions(businessId),
    body: input,
    path: { venueId },
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.resource
}

export async function changeResource(
  businessId: string,
  venueId: string,
  resource: Resource,
  state: Resource["state"],
): Promise<Resource> {
  const result = await updateResource({
    ...requestOptions(businessId),
    body: { expectedVersion: resource.version, state },
    path: { resourceId: resource.id, venueId },
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.resource
}

export async function addOffering(
  businessId: string,
  venueId: string,
  input: {
    activityId: string
    durationMinutes: number
    name: string
    resourceIds: string[]
    state: Offering["state"]
  },
): Promise<Offering> {
  const result = await createOffering({
    ...requestOptions(businessId),
    body: input,
    path: { venueId },
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.offering
}

export async function changeOffering(
  businessId: string,
  venueId: string,
  offering: Offering,
  state: Offering["state"],
): Promise<Offering> {
  const result = await updateOffering({
    ...requestOptions(businessId),
    body: { expectedVersion: offering.version, state },
    path: { offeringId: offering.id, venueId },
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.offering
}

export async function addScheduleVersion(
  businessId: string,
  venueId: string,
  input: CreateScheduleVersionInput,
): Promise<ScheduleVersion> {
  const result = await createScheduleVersion({
    ...requestOptions(businessId),
    body: input,
    path: { venueId },
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.schedule
}

export async function loadSlotPreview(
  businessId: string,
  venueId: string,
  query: {
    offeringId: string
    operationalDate: string
    resourceId: string
  },
): Promise<SlotPreview> {
  const result = await previewFixedSlots({
    ...requestOptions(businessId),
    path: { venueId },
    query,
  })
  if (result.error !== undefined) throwApiError(result.error)
  return result.data.preview
}
