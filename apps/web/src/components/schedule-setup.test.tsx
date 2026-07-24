import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  addScheduleVersion,
  ConfigurationApiError,
  loadScheduleSetup,
  loadSlotPreview,
} from "../lib/configuration-api"
import { ScheduleSetup } from "./schedule-setup"

vi.mock("../lib/configuration-api", async () => {
  const actual = await vi.importActual("../lib/configuration-api")
  return {
    ...actual,
    addScheduleVersion: vi.fn(),
    loadScheduleSetup: vi.fn(),
    loadSlotPreview: vi.fn(),
  }
})

const businessId = "019b7000-0000-7000-8000-000000000001"
const venueId = "019b7000-0000-7000-8000-000000000201"
const activityId = "019b7000-0000-7000-8000-000000000401"
const resource = {
  activityId,
  createdAt: "2026-07-24T10:00:00.000Z",
  id: "019b7000-0000-7000-8000-000000000301",
  name: "Football Turf 1",
  state: "ACTIVE" as const,
  updatedAt: "2026-07-24T10:00:00.000Z",
  venueId,
  version: 1,
}
const offering = {
  activityId,
  createdAt: "2026-07-24T10:00:00.000Z",
  durationMinutes: 60,
  id: "019b7000-0000-7000-8000-000000000501",
  name: "Football — 60 minutes",
  resourceIds: [resource.id],
  state: "ACTIVE" as const,
  updatedAt: "2026-07-24T10:00:00.000Z",
  venueId,
  version: 1,
}
const weeklyPeriods = Array.from({ length: 7 }, (_, index) => ({
  closesAt: "23:00",
  crossesMidnight: false,
  opensAt: "08:00",
  weekday: index + 1,
}))
const schedule = {
  createdAt: "2026-07-24T10:00:00.000Z",
  effectiveFrom: "2026-07-27",
  effectiveUntil: null,
  exceptions: [
    {
      kind: "CLOSED" as const,
      localDate: "2026-07-28",
      periods: [],
      reason: "Private event",
    },
  ],
  id: "019b7000-0000-7000-8000-000000000801",
  resourceId: null,
  scope: "VENUE" as const,
  timezone: "Asia/Dhaka",
  venueId,
  version: 1,
  weeklyPeriods,
}
const preview = {
  offeringDurationMinutes: 60,
  operationalDate: "2026-07-27",
  scheduleScope: "VENUE" as const,
  scheduleVersionId: schedule.id,
  slots: [
    {
      endAt: "2026-07-27T03:00:00.000Z",
      localEnd: "2026-07-27T09:00:00+06:00",
      localStart: "2026-07-27T08:00:00+06:00",
      startAt: "2026-07-27T02:00:00.000Z",
    },
  ],
  timezone: "Asia/Dhaka",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(loadScheduleSetup).mockResolvedValue({
    offerings: [offering],
    resources: [resource],
    schedules: [],
  })
})

afterEach(cleanup)

describe("ScheduleSetup", () => {
  it("shows loading, accessible controls, and the non-availability boundary", async () => {
    render(<ScheduleSetup businessId={businessId} venueId={venueId} />)

    expect(
      screen.getByRole("status", {
        name: "Loading schedules and slot inputs",
      }),
    ).toBeVisible()
    expect(await screen.findByLabelText("Effective from")).toHaveAttribute(
      "type",
      "date",
    )
    expect(screen.getAllByLabelText("Weekday")).toHaveLength(7)
    expect(
      screen.getByText(
        /It is not live availability and does not check bookings/i,
      ),
    ).toBeVisible()
    expect(screen.getByText("No schedules yet")).toBeVisible()
  })

  it("creates an immutable schedule with a closed exception and visible result", async () => {
    vi.mocked(addScheduleVersion).mockResolvedValue(schedule)
    const user = userEvent.setup()
    render(<ScheduleSetup businessId={businessId} venueId={venueId} />)
    const effectiveFrom = await screen.findByLabelText("Effective from")

    fireEvent.change(effectiveFrom, { target: { value: "2026-07-27" } })
    await user.click(screen.getByRole("button", { name: "Add exception" }))
    fireEvent.change(
      screen.getByLabelText("Operational date", {
        selector: "input[id^='exception-date-']",
      }),
      {
        target: { value: "2026-07-28" },
      },
    )
    await user.type(screen.getByLabelText("Reason (optional)"), "Private event")
    await user.click(
      screen.getByRole("button", { name: "Save immutable version" }),
    )

    expect(
      await screen.findByText(
        "Venue schedule version 1 is effective from 2026-07-27.",
      ),
    ).toBeVisible()
    expect(
      within(
        screen.getByRole("region", { name: "Schedule versions" }),
      ).getByText("Venue default"),
    ).toBeVisible()
    expect(addScheduleVersion).toHaveBeenCalledWith(businessId, venueId, {
      effectiveFrom: "2026-07-27",
      exceptions: [
        {
          kind: "CLOSED",
          localDate: "2026-07-28",
          periods: [],
          reason: "Private event",
        },
      ],
      weeklyPeriods,
    })
  })

  it("supports replacement periods and previews timezone-aware fixed slots", async () => {
    vi.mocked(loadSlotPreview).mockResolvedValue(preview)
    const user = userEvent.setup()
    render(<ScheduleSetup businessId={businessId} venueId={venueId} />)
    await screen.findByLabelText("Effective from")

    await user.click(screen.getByRole("button", { name: "Add exception" }))
    await user.selectOptions(screen.getByLabelText("Behavior"), "REPLACE")
    expect(screen.getByLabelText("Replacement opens")).toHaveValue("08:00")
    await user.click(
      screen.getByRole("button", { name: "Add replacement period" }),
    )
    expect(screen.getAllByLabelText("Replacement opens")).toHaveLength(2)

    fireEvent.change(
      screen.getByLabelText("Operational date", {
        selector: "#preview-date",
      }),
      {
        target: { value: "2026-07-27" },
      },
    )
    await user.click(screen.getByRole("button", { name: "Preview slots" }))

    expect(await screen.findByText("2026-07-27 schedule preview")).toBeVisible()
    expect(screen.getByText("Venue fallback")).toBeVisible()
    expect(screen.getByText("2026-07-27 08:00:00+06:00")).toBeVisible()
    expect(loadSlotPreview).toHaveBeenCalledWith(businessId, venueId, {
      offeringId: offering.id,
      operationalDate: "2026-07-27",
      resourceId: resource.id,
    })
  })

  it("preserves schedule input and offers recovery after a server validation error", async () => {
    vi.mocked(addScheduleVersion).mockRejectedValue(
      new ConfigurationApiError(
        "INVALID_SCHEDULE",
        "The schedule periods or effective dates are invalid.",
      ),
    )
    const user = userEvent.setup()
    render(<ScheduleSetup businessId={businessId} venueId={venueId} />)
    const effectiveFrom = await screen.findByLabelText("Effective from")
    fireEvent.change(effectiveFrom, { target: { value: "2026-07-27" } })

    await user.click(
      screen.getByRole("button", { name: "Save immutable version" }),
    )

    await waitFor(() =>
      expect(
        screen.getByText(
          "The schedule periods or effective dates are invalid.",
        ),
      ).toBeVisible(),
    )
    expect(effectiveFrom).toHaveValue("2026-07-27")
    expect(
      screen.getByRole("button", { name: "Reload and try again" }),
    ).toBeVisible()
  })
})
