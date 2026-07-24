import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { addOffering, loadOfferingSetup } from "../lib/configuration-api"
import { OfferingSetup } from "./offering-setup"

vi.mock("../lib/configuration-api", async () => {
  const actual = await vi.importActual("../lib/configuration-api")
  return {
    ...actual,
    addOffering: vi.fn(),
    changeOffering: vi.fn(),
    loadOfferingSetup: vi.fn(),
  }
})

const businessId = "019b7000-0000-7000-8000-000000000001"
const venueId = "019b7000-0000-7000-8000-000000000201"
const activity = {
  code: "football",
  createdAt: "2026-07-24T10:00:00.000Z",
  displayName: "Football",
  id: "019b7000-0000-7000-8000-000000000401",
  state: "ACTIVE" as const,
  updatedAt: "2026-07-24T10:00:00.000Z",
  version: 1,
}
const resource = {
  activityId: activity.id,
  createdAt: "2026-07-24T10:00:00.000Z",
  id: "019b7000-0000-7000-8000-000000000301",
  name: "Football Turf 1",
  state: "ACTIVE" as const,
  updatedAt: "2026-07-24T10:00:00.000Z",
  venueId,
  version: 1,
}
const offering = {
  activityId: activity.id,
  createdAt: "2026-07-24T10:00:00.000Z",
  durationMinutes: 60,
  id: "019b7000-0000-7000-8000-000000000501",
  name: "5-a-side football",
  resourceIds: [resource.id],
  state: "DRAFT" as const,
  updatedAt: "2026-07-24T10:00:00.000Z",
  venueId,
  version: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(loadOfferingSetup).mockResolvedValue({
    activities: [activity],
    offerings: [],
    resources: [resource],
  })
})

afterEach(cleanup)

describe("OfferingSetup", () => {
  it("associates labels, descriptions, and compatible resource choices", async () => {
    render(<OfferingSetup businessId={businessId} venueId={venueId} />)

    expect(await screen.findByLabelText("Offering name")).toBeVisible()
    expect(screen.getByLabelText("Activity")).toHaveValue(activity.id)
    expect(screen.getByLabelText("Duration in minutes")).toHaveAttribute(
      "aria-describedby",
      "offering-duration-help",
    )
    expect(screen.getByLabelText("Football Turf 1")).toHaveAttribute(
      "type",
      "checkbox",
    )
  })

  it("creates an offering and keeps the persisted result visible", async () => {
    vi.mocked(addOffering).mockResolvedValue(offering)
    const user = userEvent.setup()
    render(<OfferingSetup businessId={businessId} venueId={venueId} />)
    await screen.findByLabelText("Offering name")

    await user.type(screen.getByLabelText("Offering name"), "5-a-side football")
    await user.click(screen.getByLabelText("Football Turf 1"))
    await user.click(screen.getByRole("button", { name: "Add offering" }))

    expect(
      await screen.findByText(
        "5-a-side football now connects 1 compatible resource.",
      ),
    ).toBeVisible()
    expect(screen.getByText("60 minutes · version 1")).toBeVisible()
    expect(addOffering).toHaveBeenCalledWith(businessId, venueId, {
      activityId: activity.id,
      durationMinutes: 60,
      name: "5-a-side football",
      resourceIds: [resource.id],
      state: "DRAFT",
    })
  })
})
