"use client"

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react"
import { CalendarClock, CirclePlus, Eye, RefreshCw, Trash2 } from "lucide-react"

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
  addScheduleVersion,
  ConfigurationApiError,
  loadScheduleSetup,
  loadSlotPreview,
  type Offering,
  type Resource,
  type ScheduleVersion,
  type SlotPreview,
} from "../lib/configuration-api"
import {
  ConfigurationErrorNotice,
  type ConfigurationFeedback,
} from "./configuration-feedback"

interface ScheduleSetupProps {
  businessId: string
  venueId: string
}

interface PeriodDraft {
  closesAt: string
  crossesMidnight: boolean
  key: string
  opensAt: string
  weekday: number
}

interface ExceptionDraft {
  key: string
  kind: "CLOSED" | "REPLACE"
  localDate: string
  periods: PeriodDraft[]
  reason: string
}

const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

function key(): string {
  return globalThis.crypto.randomUUID()
}

function period(weekday: number): PeriodDraft {
  return {
    closesAt: "23:00",
    crossesMidnight: false,
    key: key(),
    opensAt: "08:00",
    weekday,
  }
}

function feedback(error: unknown): ConfigurationFeedback {
  return error instanceof ConfigurationApiError
    ? { code: error.code, message: error.message }
    : {
        code: "UNKNOWN_ERROR",
        message: "The schedule request could not be completed.",
      }
}

function resourceName(resources: Resource[], resourceId: string | null) {
  if (resourceId === null) return "Venue default"
  return (
    resources.find(({ id }) => id === resourceId)?.name ?? "Unknown resource"
  )
}

export function ScheduleSetup({ businessId, venueId }: ScheduleSetupProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [schedules, setSchedules] = useState<ScheduleVersion[]>([])
  const [weeklyPeriods, setWeeklyPeriods] = useState<PeriodDraft[]>(() =>
    Array.from({ length: 7 }, (_, index) => period(index + 1)),
  )
  const [exceptions, setExceptions] = useState<ExceptionDraft[]>([])
  const [scope, setScope] = useState<"VENUE" | "RESOURCE">("VENUE")
  const [scopeResourceId, setScopeResourceId] = useState("")
  const [previewResourceId, setPreviewResourceId] = useState("")
  const [previewOfferingId, setPreviewOfferingId] = useState("")
  const [preview, setPreview] = useState<SlotPreview>()
  const [status, setStatus] = useState<"loading" | "ready">("loading")
  const [error, setError] = useState<ConfigurationFeedback>()
  const [success, setSuccess] = useState<string>()
  const [isSaving, startSaving] = useTransition()
  const [isPreviewing, startPreviewing] = useTransition()

  const load = useCallback(async () => {
    setStatus("loading")
    setError(undefined)
    try {
      const result = await loadScheduleSetup(businessId, venueId)
      setResources(result.resources)
      setOfferings(result.offerings)
      setSchedules(result.schedules)
      const firstResource = result.resources.find(
        ({ state }) => state === "ACTIVE",
      )
      const firstOffering = result.offerings.find(
        ({ resourceIds, state }) =>
          state !== "INACTIVE" &&
          firstResource !== undefined &&
          resourceIds.includes(firstResource.id),
      )
      setScopeResourceId((current) =>
        result.resources.some(({ id }) => id === current)
          ? current
          : (firstResource?.id ?? ""),
      )
      setPreviewResourceId((current) =>
        result.resources.some(({ id }) => id === current)
          ? current
          : (firstResource?.id ?? ""),
      )
      setPreviewOfferingId((current) =>
        result.offerings.some(({ id }) => id === current)
          ? current
          : (firstOffering?.id ?? ""),
      )
    } catch (loadError) {
      setError(feedback(loadError))
    } finally {
      setStatus("ready")
    }
  }, [businessId, venueId])

  useEffect(() => {
    let cancelled = false
    void loadScheduleSetup(businessId, venueId)
      .then((result) => {
        if (cancelled) return
        setResources(result.resources)
        setOfferings(result.offerings)
        setSchedules(result.schedules)
        const firstResource = result.resources.find(
          ({ state }) => state === "ACTIVE",
        )
        const firstOffering = result.offerings.find(
          ({ resourceIds, state }) =>
            state !== "INACTIVE" &&
            firstResource !== undefined &&
            resourceIds.includes(firstResource.id),
        )
        setScopeResourceId(firstResource?.id ?? "")
        setPreviewResourceId(firstResource?.id ?? "")
        setPreviewOfferingId(firstOffering?.id ?? "")
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(feedback(loadError))
      })
      .finally(() => {
        if (!cancelled) setStatus("ready")
      })
    return () => {
      cancelled = true
    }
  }, [businessId, venueId])

  function updatePeriod(
    periodKey: string,
    update: Partial<Omit<PeriodDraft, "key">>,
  ) {
    setWeeklyPeriods((current) =>
      current.map((item) =>
        item.key === periodKey ? { ...item, ...update } : item,
      ),
    )
  }

  function updateException(
    exceptionKey: string,
    update: Partial<Omit<ExceptionDraft, "key" | "periods">>,
  ) {
    setExceptions((current) =>
      current.map((item) =>
        item.key === exceptionKey ? { ...item, ...update } : item,
      ),
    )
  }

  function updateExceptionPeriod(
    exceptionKey: string,
    periodKey: string,
    update: Partial<Omit<PeriodDraft, "key" | "weekday">>,
  ) {
    setExceptions((current) =>
      current.map((exception) =>
        exception.key === exceptionKey
          ? {
              ...exception,
              periods: exception.periods.map((item) =>
                item.key === periodKey ? { ...item, ...update } : item,
              ),
            }
          : exception,
      ),
    )
  }

  function addException() {
    setExceptions((current) => [
      ...current,
      {
        key: key(),
        kind: "CLOSED",
        localDate: "",
        periods: [],
        reason: "",
      },
    ])
  }

  function setExceptionKind(
    exceptionKey: string,
    kind: ExceptionDraft["kind"],
  ) {
    setExceptions((current) =>
      current.map((exception) =>
        exception.key === exceptionKey
          ? {
              ...exception,
              kind,
              periods:
                kind === "REPLACE" && exception.periods.length === 0
                  ? [period(1)]
                  : kind === "CLOSED"
                    ? []
                    : exception.periods,
            }
          : exception,
      ),
    )
  }

  function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setError(undefined)
    setSuccess(undefined)

    if (weeklyPeriods.length === 0) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Add at least one weekly operating period.",
      })
      return
    }
    if (scope === "RESOURCE" && scopeResourceId.length === 0) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Select the resource this override belongs to.",
      })
      return
    }

    startSaving(async () => {
      try {
        const schedule = await addScheduleVersion(businessId, venueId, {
          effectiveFrom: String(values.get("effectiveFrom")),
          exceptions: exceptions.map((exception) => ({
            kind: exception.kind,
            localDate: exception.localDate,
            periods: exception.periods.map(
              ({ closesAt, crossesMidnight, opensAt }) => ({
                closesAt,
                crossesMidnight,
                opensAt,
              }),
            ),
            ...(exception.reason.trim().length === 0
              ? {}
              : { reason: exception.reason.trim() }),
          })),
          ...(scope === "RESOURCE" ? { resourceId: scopeResourceId } : {}),
          weeklyPeriods: weeklyPeriods.map(
            ({ closesAt, crossesMidnight, opensAt, weekday }) => ({
              closesAt,
              crossesMidnight,
              opensAt,
              weekday,
            }),
          ),
        })
        setSchedules((current) => [schedule, ...current])
        setSuccess(
          `${schedule.scope === "VENUE" ? "Venue" : "Resource"} schedule version ${schedule.version} is effective from ${schedule.effectiveFrom}.`,
        )
      } catch (saveError) {
        setError(feedback(saveError))
      }
    })
  }

  const compatiblePreviewOfferings = offerings.filter(
    ({ resourceIds, state }) =>
      state !== "INACTIVE" && resourceIds.includes(previewResourceId),
  )

  function changePreviewResource(resourceId: string) {
    setPreviewResourceId(resourceId)
    const firstCompatible = offerings.find(
      ({ resourceIds, state }) =>
        state !== "INACTIVE" && resourceIds.includes(resourceId),
    )
    setPreviewOfferingId((current) =>
      offerings.some(
        ({ id, resourceIds, state }) =>
          id === current &&
          state !== "INACTIVE" &&
          resourceIds.includes(resourceId),
      )
        ? current
        : (firstCompatible?.id ?? ""),
    )
    setPreview(undefined)
  }

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setError(undefined)
    setSuccess(undefined)
    startPreviewing(async () => {
      try {
        setPreview(
          await loadSlotPreview(businessId, venueId, {
            offeringId: previewOfferingId,
            operationalDate: String(values.get("operationalDate")),
            resourceId: previewResourceId,
          }),
        )
      } catch (previewError) {
        setError(feedback(previewError))
      }
    })
  }

  if (status === "loading") {
    return (
      <div
        aria-label="Loading schedules and slot inputs"
        className="flex min-h-40 items-center gap-3"
        role="status"
      >
        <RefreshCw aria-hidden="true" className="size-5 animate-spin" />
        Loading schedules and slot inputs…
      </div>
    )
  }

  const activeResources = resources.filter(({ state }) => state === "ACTIVE")

  return (
    <div className="space-y-8">
      {error === undefined ? null : (
        <ConfigurationErrorNotice error={error} onRetry={() => void load()} />
      )}
      {success === undefined ? null : (
        <Alert variant="success">
          <AlertTitle>Schedule saved</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <CalendarClock aria-hidden="true" className="size-4" />
        <AlertTitle>Schedule configuration only</AlertTitle>
        <AlertDescription>
          Slot preview shows operating-time boundaries. It is not live
          availability and does not check bookings, blocks, prices, or policies.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Create a schedule version</CardTitle>
          <CardDescription>
            Versions are immutable. A later effective version safely replaces
            the earlier timeline without rewriting historical interpretation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-7" onSubmit={submitSchedule}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="schedule-effective-from">Effective from</Label>
                <Input
                  id="schedule-effective-from"
                  name="effectiveFrom"
                  required
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-scope">Schedule scope</Label>
                <NativeSelect
                  id="schedule-scope"
                  onChange={(event) =>
                    setScope(event.currentTarget.value as "VENUE" | "RESOURCE")
                  }
                  value={scope}
                >
                  <option value="VENUE">Venue default</option>
                  <option value="RESOURCE">Resource override</option>
                </NativeSelect>
              </div>
              {scope === "RESOURCE" ? (
                <div className="space-y-2">
                  <Label htmlFor="schedule-resource">Resource</Label>
                  <NativeSelect
                    id="schedule-resource"
                    onChange={(event) =>
                      setScopeResourceId(event.currentTarget.value)
                    }
                    required
                    value={scopeResourceId}
                  >
                    <option value="">Select resource</option>
                    {activeResources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              ) : null}
            </div>

            <fieldset className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <legend className="font-medium">
                    Weekly operating periods
                  </legend>
                  <p className="text-muted-foreground text-sm">
                    Add another row when one weekday has split operating hours.
                  </p>
                </div>
                <Button
                  className="min-h-11"
                  onClick={() =>
                    setWeeklyPeriods((current) => [...current, period(1)])
                  }
                  type="button"
                  variant="outline"
                >
                  <CirclePlus aria-hidden="true" />
                  Add period
                </Button>
              </div>

              <div className="space-y-3">
                {weeklyPeriods.map((item, index) => (
                  <div
                    className="border-border grid gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto] lg:items-end"
                    key={item.key}
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`weekly-weekday-${item.key}`}>
                        Weekday
                      </Label>
                      <NativeSelect
                        id={`weekly-weekday-${item.key}`}
                        onChange={(event) =>
                          updatePeriod(item.key, {
                            weekday: Number(event.currentTarget.value),
                          })
                        }
                        value={item.weekday}
                      >
                        {weekdayNames.map((name, weekdayIndex) => (
                          <option key={name} value={weekdayIndex + 1}>
                            {name}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`weekly-open-${item.key}`}>Opens</Label>
                      <Input
                        id={`weekly-open-${item.key}`}
                        onChange={(event) =>
                          updatePeriod(item.key, {
                            opensAt: event.currentTarget.value,
                          })
                        }
                        required
                        type="time"
                        value={item.opensAt}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`weekly-close-${item.key}`}>Closes</Label>
                      <Input
                        id={`weekly-close-${item.key}`}
                        onChange={(event) =>
                          updatePeriod(item.key, {
                            closesAt: event.currentTarget.value,
                          })
                        }
                        required
                        type="time"
                        value={item.closesAt}
                      />
                    </div>
                    <label className="border-input flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm">
                      <input
                        checked={item.crossesMidnight}
                        className="accent-primary size-5"
                        onChange={(event) =>
                          updatePeriod(item.key, {
                            crossesMidnight: event.currentTarget.checked,
                          })
                        }
                        type="checkbox"
                      />
                      Next day
                    </label>
                    <Button
                      aria-label={`Remove weekly period ${index + 1}`}
                      className="min-h-11"
                      disabled={weeklyPeriods.length === 1}
                      onClick={() =>
                        setWeeklyPeriods((current) =>
                          current.filter(({ key }) => key !== item.key),
                        )
                      }
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" />
                      <span className="lg:sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <legend className="font-medium">
                    Specific-date exceptions
                  </legend>
                  <p className="text-muted-foreground text-sm">
                    Close a date or replace its normal periods completely.
                  </p>
                </div>
                <Button
                  className="min-h-11"
                  onClick={addException}
                  type="button"
                  variant="outline"
                >
                  <CirclePlus aria-hidden="true" />
                  Add exception
                </Button>
              </div>

              {exceptions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No date exceptions in this version.
                </p>
              ) : (
                <div className="space-y-4">
                  {exceptions.map((exception, exceptionIndex) => (
                    <div
                      className="border-border space-y-4 rounded-lg border p-4"
                      key={exception.key}
                    >
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`exception-date-${exception.key}`}>
                            Operational date
                          </Label>
                          <Input
                            id={`exception-date-${exception.key}`}
                            onChange={(event) =>
                              updateException(exception.key, {
                                localDate: event.currentTarget.value,
                              })
                            }
                            required
                            type="date"
                            value={exception.localDate}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`exception-kind-${exception.key}`}>
                            Behavior
                          </Label>
                          <NativeSelect
                            id={`exception-kind-${exception.key}`}
                            onChange={(event) =>
                              setExceptionKind(
                                exception.key,
                                event.currentTarget
                                  .value as ExceptionDraft["kind"],
                              )
                            }
                            value={exception.kind}
                          >
                            <option value="CLOSED">Closed</option>
                            <option value="REPLACE">Replace hours</option>
                          </NativeSelect>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`exception-reason-${exception.key}`}>
                            Reason (optional)
                          </Label>
                          <Input
                            id={`exception-reason-${exception.key}`}
                            maxLength={240}
                            onChange={(event) =>
                              updateException(exception.key, {
                                reason: event.currentTarget.value,
                              })
                            }
                            value={exception.reason}
                          />
                        </div>
                        <Button
                          aria-label={`Remove exception ${exceptionIndex + 1}`}
                          className="min-h-11"
                          onClick={() =>
                            setExceptions((current) =>
                              current.filter(
                                ({ key }) => key !== exception.key,
                              ),
                            )
                          }
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 aria-hidden="true" />
                          <span className="lg:sr-only">Remove</span>
                        </Button>
                      </div>

                      {exception.kind === "REPLACE" ? (
                        <div className="space-y-3">
                          {exception.periods.map((replacement, index) => (
                            <div
                              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end"
                              key={replacement.key}
                            >
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`exception-open-${replacement.key}`}
                                >
                                  Replacement opens
                                </Label>
                                <Input
                                  id={`exception-open-${replacement.key}`}
                                  onChange={(event) =>
                                    updateExceptionPeriod(
                                      exception.key,
                                      replacement.key,
                                      {
                                        opensAt: event.currentTarget.value,
                                      },
                                    )
                                  }
                                  required
                                  type="time"
                                  value={replacement.opensAt}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`exception-close-${replacement.key}`}
                                >
                                  Replacement closes
                                </Label>
                                <Input
                                  id={`exception-close-${replacement.key}`}
                                  onChange={(event) =>
                                    updateExceptionPeriod(
                                      exception.key,
                                      replacement.key,
                                      {
                                        closesAt: event.currentTarget.value,
                                      },
                                    )
                                  }
                                  required
                                  type="time"
                                  value={replacement.closesAt}
                                />
                              </div>
                              <label className="border-input flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm">
                                <input
                                  checked={replacement.crossesMidnight}
                                  className="accent-primary size-5"
                                  onChange={(event) =>
                                    updateExceptionPeriod(
                                      exception.key,
                                      replacement.key,
                                      {
                                        crossesMidnight:
                                          event.currentTarget.checked,
                                      },
                                    )
                                  }
                                  type="checkbox"
                                />
                                Next day
                              </label>
                              <Button
                                aria-label={`Remove replacement period ${index + 1}`}
                                className="min-h-11"
                                disabled={exception.periods.length === 1}
                                onClick={() =>
                                  setExceptions((current) =>
                                    current.map((item) =>
                                      item.key === exception.key
                                        ? {
                                            ...item,
                                            periods: item.periods.filter(
                                              ({ key }) =>
                                                key !== replacement.key,
                                            ),
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                type="button"
                                variant="ghost"
                              >
                                <Trash2 aria-hidden="true" />
                                <span className="lg:sr-only">Remove</span>
                              </Button>
                            </div>
                          ))}
                          <Button
                            className="min-h-11"
                            onClick={() =>
                              setExceptions((current) =>
                                current.map((item) =>
                                  item.key === exception.key
                                    ? {
                                        ...item,
                                        periods: [...item.periods, period(1)],
                                      }
                                    : item,
                                ),
                              )
                            }
                            type="button"
                            variant="outline"
                          >
                            <CirclePlus aria-hidden="true" />
                            Add replacement period
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </fieldset>

            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? (
                <RefreshCw aria-hidden="true" className="animate-spin" />
              ) : (
                <CirclePlus aria-hidden="true" />
              )}
              Save immutable version
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview fixed internal slots</CardTitle>
          <CardDescription>
            Choose an offering, compatible resource, and operational date. The
            server resolves the effective resource override or venue fallback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {activeResources.length === 0 || offerings.length === 0 ? (
            <Alert>
              <AlertTitle>Offering and resource required</AlertTitle>
              <AlertDescription>
                Create an active resource and compatible fixed-duration offering
                before previewing slots.
              </AlertDescription>
            </Alert>
          ) : (
            <form
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={submitPreview}
            >
              <div className="space-y-2">
                <Label htmlFor="preview-resource">Resource</Label>
                <NativeSelect
                  id="preview-resource"
                  onChange={(event) =>
                    changePreviewResource(event.currentTarget.value)
                  }
                  required
                  value={previewResourceId}
                >
                  {activeResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview-offering">Offering</Label>
                <NativeSelect
                  id="preview-offering"
                  onChange={(event) =>
                    setPreviewOfferingId(event.currentTarget.value)
                  }
                  required
                  value={previewOfferingId}
                >
                  {compatiblePreviewOfferings.map((offering) => (
                    <option key={offering.id} value={offering.id}>
                      {offering.name} · {offering.durationMinutes} min
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview-date">Operational date</Label>
                <Input
                  id="preview-date"
                  name="operationalDate"
                  required
                  type="date"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="min-h-11 w-full"
                  disabled={
                    isPreviewing || compatiblePreviewOfferings.length === 0
                  }
                  type="submit"
                >
                  {isPreviewing ? (
                    <RefreshCw aria-hidden="true" className="animate-spin" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                  Preview slots
                </Button>
              </div>
            </form>
          )}

          {preview === undefined ? null : (
            <section
              aria-labelledby="slot-preview-heading"
              className="space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold" id="slot-preview-heading">
                    {preview.operationalDate} schedule preview
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {preview.timezone} · {preview.offeringDurationMinutes}{" "}
                    minutes · half-open intervals
                  </p>
                </div>
                <Badge variant="outline">
                  {preview.scheduleScope === "RESOURCE"
                    ? "Resource override"
                    : "Venue fallback"}
                </Badge>
              </div>
              {preview.slots.length === 0 ? (
                <Alert>
                  <AlertTitle>No complete fixed slots</AlertTitle>
                  <AlertDescription>
                    The date is closed, has no matching period, or its remaining
                    period is shorter than the offering duration.
                  </AlertDescription>
                </Alert>
              ) : (
                <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {preview.slots.map((slot) => (
                    <li
                      className="border-border rounded-lg border p-3 text-sm"
                      key={slot.startAt}
                    >
                      <p className="font-medium">
                        {slot.localStart.replace("T", " ")}
                      </p>
                      <p className="text-muted-foreground">
                        to {slot.localEnd.replace("T", " ")}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
        </CardContent>
      </Card>

      <section
        aria-labelledby="schedule-versions-heading"
        className="space-y-4"
      >
        <div>
          <h2 className="text-xl font-semibold" id="schedule-versions-heading">
            Schedule versions
          </h2>
          <p className="text-muted-foreground text-sm">
            Effective dates are local operational dates, not stored instants.
          </p>
        </div>
        {schedules.length === 0 ? (
          <Alert>
            <AlertTitle>No schedules yet</AlertTitle>
            <AlertDescription>
              Save a venue schedule before previewing internal slots.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>
                        {resourceName(resources, schedule.resourceId)}
                      </CardTitle>
                      <CardDescription>{schedule.timezone}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      Version {schedule.version}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Effective {schedule.effectiveFrom} to{" "}
                    {schedule.effectiveUntil ?? "ongoing"}
                  </p>
                  <p className="text-muted-foreground">
                    {schedule.weeklyPeriods.length} weekly period
                    {schedule.weeklyPeriods.length === 1 ? "" : "s"} ·{" "}
                    {schedule.exceptions.length} exception
                    {schedule.exceptions.length === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
