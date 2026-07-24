"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { Clock3, Plus, RefreshCw } from "lucide-react"

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
  addOffering,
  changeOffering,
  ConfigurationApiError,
  loadOfferingSetup,
  type Activity,
  type Offering,
  type Resource,
} from "../lib/configuration-api"
import {
  ConfigurationErrorNotice,
  type ConfigurationFeedback,
} from "./configuration-feedback"

interface OfferingSetupProps {
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

export function OfferingSetup({ businessId, venueId }: OfferingSetupProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState("")
  const [status, setStatus] = useState<"loading" | "ready">("loading")
  const [error, setError] = useState<ConfigurationFeedback>()
  const [success, setSuccess] = useState<string>()
  const [pendingId, setPendingId] = useState<string>()

  const load = useCallback(async () => {
    setStatus("loading")
    setError(undefined)
    try {
      const result = await loadOfferingSetup(businessId, venueId)
      setActivities(result.activities)
      setResources(result.resources)
      setOfferings(result.offerings)
      const firstActivity = result.activities.find(
        ({ state }) => state === "ACTIVE",
      )
      setSelectedActivityId((current) =>
        result.activities.some(
          ({ id, state }) => id === current && state === "ACTIVE",
        )
          ? current
          : (firstActivity?.id ?? ""),
      )
    } catch (loadError) {
      setError(feedback(loadError))
    } finally {
      setStatus("ready")
    }
  }, [businessId, venueId])

  useEffect(() => {
    let cancelled = false

    void loadOfferingSetup(businessId, venueId)
      .then((result) => {
        if (cancelled) return
        setActivities(result.activities)
        setResources(result.resources)
        setOfferings(result.offerings)
        const firstActivity = result.activities.find(
          ({ state }) => state === "ACTIVE",
        )
        setSelectedActivityId(firstActivity?.id ?? "")
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

  async function submitOffering(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    const form = event.currentTarget
    const values = new FormData(form)
    const resourceIds = values
      .getAll("resourceIds")
      .map((resourceId) => String(resourceId))

    if (resourceIds.length === 0) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Select at least one compatible active resource.",
      })
      return
    }

    try {
      const offering = await addOffering(businessId, venueId, {
        activityId: String(values.get("activityId")),
        durationMinutes: Number(values.get("durationMinutes")),
        name: String(values.get("name")),
        resourceIds,
        state: String(values.get("state")) as Offering["state"],
      })
      setOfferings((current) => [...current, offering])
      setSuccess(
        `${offering.name} now connects ${offering.resourceIds.length} compatible resource${offering.resourceIds.length === 1 ? "" : "s"}.`,
      )
      form.reset()
      setSelectedActivityId(offering.activityId)
    } catch (saveError) {
      setError(feedback(saveError))
    }
  }

  async function toggleOffering(offering: Offering) {
    setPendingId(offering.id)
    setError(undefined)
    setSuccess(undefined)
    try {
      const updated = await changeOffering(
        businessId,
        venueId,
        offering,
        offering.state === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      )
      setOfferings((current) =>
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
        aria-label="Loading offerings and compatibility"
        className="flex min-h-40 items-center gap-3"
        role="status"
      >
        <RefreshCw aria-hidden="true" className="size-5 animate-spin" />
        Loading offerings and compatibility…
      </div>
    )
  }

  const activeActivities = activities.filter(({ state }) => state === "ACTIVE")
  const compatibleResources = resources.filter(
    ({ activityId, state }) =>
      activityId === selectedActivityId && state === "ACTIVE",
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

      <Card>
        <CardHeader>
          <CardTitle>Create a fixed-duration offering</CardTitle>
          <CardDescription>
            This connects one activity to one or more compatible independent
            resources. Scheduling and pricing are intentionally not created
            here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeActivities.length === 0 ? (
            <Alert>
              <AlertTitle>Active configuration required</AlertTitle>
              <AlertDescription>
                Create an active activity and resource before an offering.
              </AlertDescription>
            </Alert>
          ) : (
            <form
              className="grid gap-5 lg:grid-cols-2"
              onSubmit={submitOffering}
            >
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="offering-name">Offering name</Label>
                <Input
                  id="offering-name"
                  name="name"
                  placeholder="5-a-side football"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offering-activity">Activity</Label>
                <NativeSelect
                  id="offering-activity"
                  name="activityId"
                  onChange={(event) =>
                    setSelectedActivityId(event.currentTarget.value)
                  }
                  required
                  value={selectedActivityId}
                >
                  {activeActivities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.displayName}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offering-duration">Duration in minutes</Label>
                <Input
                  aria-describedby="offering-duration-help"
                  defaultValue="60"
                  id="offering-duration"
                  inputMode="numeric"
                  max="1440"
                  min="1"
                  name="durationMinutes"
                  required
                  type="number"
                />
                <p
                  className="text-muted-foreground text-sm"
                  id="offering-duration-help"
                >
                  Common choices are 60, 90, and 120 minutes.
                </p>
              </div>

              <fieldset className="space-y-2 lg:col-span-2">
                <legend className="text-sm font-medium">
                  Compatible active resources
                </legend>
                {compatibleResources.length === 0 ? (
                  <p className="text-destructive text-sm">
                    No active resource supports the selected activity.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {compatibleResources.map((resource) => (
                      <label
                        className="border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm focus-within:ring-3"
                        key={resource.id}
                      >
                        <input
                          className="accent-primary size-5"
                          name="resourceIds"
                          type="checkbox"
                          value={resource.id}
                        />
                        <span>{resource.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="offering-state">Initial state</Label>
                <NativeSelect id="offering-state" name="state">
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </NativeSelect>
              </div>

              <div className="flex items-end">
                <Button
                  className="min-h-11 w-full sm:w-auto"
                  disabled={compatibleResources.length === 0}
                  type="submit"
                >
                  <Plus aria-hidden="true" />
                  Add offering
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="offerings-heading" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold" id="offerings-heading">
            Configured offerings
          </h2>
          <p className="text-muted-foreground text-sm">
            An active offering always retains at least one compatible active
            resource.
          </p>
        </div>

        {offerings.length === 0 ? (
          <Alert>
            <AlertTitle>No offerings yet</AlertTitle>
            <AlertDescription>
              Connect the first activity, duration, and playable resource.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {offerings.map((offering) => {
              const activity = activities.find(
                ({ id }) => id === offering.activityId,
              )
              const linkedResources = offering.resourceIds
                .map(
                  (resourceId) =>
                    resources.find(({ id }) => id === resourceId)?.name,
                )
                .filter((name): name is string => name !== undefined)

              return (
                <Card key={offering.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{offering.name}</CardTitle>
                        <CardDescription>
                          {activity?.displayName ?? "Unknown activity"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          offering.state === "ACTIVE" ? "secondary" : "outline"
                        }
                      >
                        {offering.state}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Clock3 aria-hidden="true" className="size-4" />
                      {offering.durationMinutes} minutes · version{" "}
                      {offering.version}
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Resources:</span>{" "}
                      {linkedResources.join(", ")}
                    </p>
                    <Button
                      className="min-h-11"
                      disabled={pendingId === offering.id}
                      onClick={() => void toggleOffering(offering)}
                      type="button"
                      variant="outline"
                    >
                      {offering.state === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
