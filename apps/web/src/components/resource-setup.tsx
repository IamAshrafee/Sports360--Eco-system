"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { ActivityIcon, Plus, RefreshCw } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@sports/ui/components/alert"
import { Badge } from "@sports/ui/components/badge"
import { Button } from "@sports/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sports/ui/components/card"
import { Input } from "@sports/ui/components/input"
import { Label } from "@sports/ui/components/label"
import { NativeSelect } from "@sports/ui/components/native-select"

import {
  addActivity,
  addResource,
  changeActivity,
  changeResource,
  ConfigurationApiError,
  loadResourceSetup,
  type Activity,
  type Resource,
} from "../lib/configuration-api"
import {
  ConfigurationErrorNotice,
  type ConfigurationFeedback,
} from "./configuration-feedback"

interface ResourceSetupProps {
  businessId: string
  venueId: string
}

function feedback(error: unknown): ConfigurationFeedback {
  return error instanceof ConfigurationApiError
    ? { code: error.code, message: error.message }
    : {
        code: "UNKNOWN_ERROR",
        message: "The configuration request could not be completed.",
      }
}

export function ResourceSetup({ businessId, venueId }: ResourceSetupProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [status, setStatus] = useState<"loading" | "ready">("loading")
  const [error, setError] = useState<ConfigurationFeedback>()
  const [success, setSuccess] = useState<string>()
  const [pendingId, setPendingId] = useState<string>()

  const load = useCallback(async () => {
    setStatus("loading")
    setError(undefined)
    try {
      const result = await loadResourceSetup(businessId, venueId)
      setActivities(result.activities)
      setResources(result.resources)
    } catch (loadError) {
      setError(feedback(loadError))
    } finally {
      setStatus("ready")
    }
  }, [businessId, venueId])

  useEffect(() => {
    let cancelled = false

    void loadResourceSetup(businessId, venueId)
      .then((result) => {
        if (cancelled) return
        setActivities(result.activities)
        setResources(result.resources)
      })
      .catch((loadError: unknown) => {
        if (cancelled) return
        setError(feedback(loadError))
      })
      .finally(() => {
        if (cancelled) return
        setStatus("ready")
      })

    return () => {
      cancelled = true
    }
  }, [businessId, venueId])

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    const form = event.currentTarget
    const values = new FormData(form)

    try {
      const activity = await addActivity(businessId, {
        code: String(values.get("code")),
        displayName: String(values.get("displayName")),
      })
      setActivities((current) => [...current, activity])
      setSuccess(`${activity.displayName} is now available for resources.`)
      form.reset()
    } catch (saveError) {
      setError(feedback(saveError))
    }
  }

  async function submitResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    const form = event.currentTarget
    const values = new FormData(form)

    try {
      const resource = await addResource(businessId, venueId, {
        activityId: String(values.get("activityId")),
        name: String(values.get("name")),
        state: String(values.get("state")) as Resource["state"],
      })
      setResources((current) => [...current, resource])
      setSuccess(`${resource.name} was added as one independent resource.`)
      form.reset()
    } catch (saveError) {
      setError(feedback(saveError))
    }
  }

  async function toggleActivity(activity: Activity) {
    setPendingId(activity.id)
    setError(undefined)
    setSuccess(undefined)
    try {
      const updated = await changeActivity(
        businessId,
        activity,
        activity.state === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      )
      setActivities((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSuccess(
        `${updated.displayName} is now ${updated.state.toLowerCase()}.`,
      )
    } catch (saveError) {
      setError(feedback(saveError))
    } finally {
      setPendingId(undefined)
    }
  }

  async function toggleResource(resource: Resource) {
    setPendingId(resource.id)
    setError(undefined)
    setSuccess(undefined)
    try {
      const updated = await changeResource(
        businessId,
        venueId,
        resource,
        resource.state === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      )
      setResources((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSuccess(`${updated.name} is now ${updated.state.toLowerCase()}.`)
    } catch (saveError) {
      setError(feedback(saveError))
    } finally {
      setPendingId(undefined)
    }
  }

  if (status === "loading") {
    return (
      <div
        aria-label="Loading activities and resources"
        className="flex min-h-40 items-center gap-3"
        role="status"
      >
        <RefreshCw aria-hidden="true" className="size-5 animate-spin" />
        Loading activities and resources…
      </div>
    )
  }

  const activeActivities = activities.filter(
    (activity) => activity.state === "ACTIVE",
  )

  return (
    <div className="space-y-6">
      {error === undefined ? null : (
        <ConfigurationErrorNotice error={error} onRetry={() => void load()} />
      )}
      {success === undefined ? null : (
        <Alert variant="success">
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add an activity</CardTitle>
            <CardDescription>
              Activities belong to this business and can be reused by its
              venues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitActivity}>
              <div className="space-y-2">
                <Label htmlFor="activity-name">Display name</Label>
                <Input
                  id="activity-name"
                  name="displayName"
                  placeholder="Football"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-code">Stable code</Label>
                <Input
                  aria-describedby="activity-code-help"
                  id="activity-code"
                  name="code"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="football"
                  required
                />
                <p
                  className="text-muted-foreground text-sm"
                  id="activity-code-help"
                >
                  Lowercase letters, numbers, and single hyphens.
                </p>
              </div>
              <Button className="min-h-11 w-full sm:w-auto" type="submit">
                <Plus aria-hidden="true" />
                Add activity
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add an independent resource</CardTitle>
            <CardDescription>
              Each resource represents exactly one independently bookable court,
              turf, table, lane, room, or field.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeActivities.length === 0 ? (
              <Alert>
                <AlertTitle>Create an active activity first</AlertTitle>
                <AlertDescription>
                  A resource must link to one tenant-owned activity.
                </AlertDescription>
              </Alert>
            ) : (
              <form className="space-y-4" onSubmit={submitResource}>
                <div className="space-y-2">
                  <Label htmlFor="resource-name">Resource name</Label>
                  <Input
                    id="resource-name"
                    name="name"
                    placeholder="Football Turf 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-activity">Activity</Label>
                  <NativeSelect
                    id="resource-activity"
                    name="activityId"
                    required
                  >
                    {activeActivities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.displayName}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-state">Initial state</Label>
                  <NativeSelect id="resource-state" name="state">
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </NativeSelect>
                </div>
                <Button className="min-h-11 w-full sm:w-auto" type="submit">
                  <Plus aria-hidden="true" />
                  Add resource
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="configured-heading" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold" id="configured-heading">
            Configured venue capacity
          </h2>
          <p className="text-muted-foreground text-sm">
            State is always communicated with text, not color alone.
          </p>
        </div>

        {activities.length === 0 && resources.length === 0 ? (
          <Alert>
            <AlertTitle>No configuration yet</AlertTitle>
            <AlertDescription>
              Add the venue’s first activity, then its playable resource.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <ConfigurationList
              activities={activities}
              pendingId={pendingId}
              resources={resources}
              toggleActivity={toggleActivity}
              toggleResource={toggleResource}
            />
          </div>
        )}
      </section>
    </div>
  )
}

function ConfigurationList({
  activities,
  pendingId,
  resources,
  toggleActivity,
  toggleResource,
}: {
  activities: Activity[]
  pendingId: string | undefined
  resources: Resource[]
  toggleActivity: (activity: Activity) => Promise<void>
  toggleResource: (resource: Resource) => Promise<void>
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
          <CardDescription>{activities.length} configured</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-border divide-y">
            {activities.map((activity) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                key={activity.id}
              >
                <div>
                  <p className="font-medium">{activity.displayName}</p>
                  <p className="text-muted-foreground text-sm">
                    {activity.code} · version {activity.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      activity.state === "ACTIVE" ? "secondary" : "outline"
                    }
                  >
                    {activity.state}
                  </Badge>
                  <Button
                    className="min-h-11"
                    disabled={pendingId === activity.id}
                    onClick={() => void toggleActivity(activity)}
                    type="button"
                    variant="outline"
                  >
                    {activity.state === "ACTIVE" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Independent resources</CardTitle>
          <CardDescription>{resources.length} configured</CardDescription>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <ActivityIcon aria-hidden="true" className="size-4" />
              No playable resources yet.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {resources.map((resource) => {
                const activity = activities.find(
                  ({ id }) => id === resource.activityId,
                )
                return (
                  <li
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    key={resource.id}
                  >
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {activity?.displayName ?? "Unknown activity"} · one unit
                        · version {resource.version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          resource.state === "ACTIVE" ? "secondary" : "outline"
                        }
                      >
                        {resource.state}
                      </Badge>
                      <Button
                        className="min-h-11"
                        disabled={pendingId === resource.id}
                        onClick={() => void toggleResource(resource)}
                        type="button"
                        variant="outline"
                      >
                        {resource.state === "ACTIVE"
                          ? "Deactivate"
                          : "Activate"}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
