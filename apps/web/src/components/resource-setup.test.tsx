import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  addActivity,
  changeActivity,
  ConfigurationApiError,
  loadResourceSetup,
} from "../lib/configuration-api"
import { ResourceSetup } from "./resource-setup"

vi.mock("../lib/configuration-api", async () => {
  const actual = await vi.importActual("../lib/configuration-api")
  return {
    ...actual,
    addActivity: vi.fn(),
    addResource: vi.fn(),
    changeActivity: vi.fn(),
    changeResource: vi.fn(),
    loadResourceSetup: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(loadResourceSetup).mockResolvedValue({
    activities: [],
    resources: [],
  })
})

afterEach(cleanup)

describe("ResourceSetup", () => {
  it("shows loading and then an actionable empty state", async () => {
    render(<ResourceSetup businessId={businessId} venueId={venueId} />)

    expect(
      screen.getByRole("status", {
        name: /loading activities and resources/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText("No configuration yet")).toBeInTheDocument()
    expect(screen.getByLabelText("Display name")).toBeVisible()
    expect(screen.getByLabelText("Stable code")).toHaveAttribute(
      "aria-describedby",
      "activity-code-help",
    )
  })

  it("supports keyboard activity creation and leaves visible saved evidence", async () => {
    vi.mocked(addActivity).mockResolvedValue(activity)
    const user = userEvent.setup()
    render(<ResourceSetup businessId={businessId} venueId={venueId} />)
    await screen.findByText("No configuration yet")

    const name = screen.getByLabelText("Display name")
    await user.click(name)
    await user.type(name, "Football")
    await user.tab()
    await user.type(screen.getByLabelText("Stable code"), "football")
    await user.click(screen.getByRole("button", { name: "Add activity" }))

    expect(
      await screen.findByText("Football is now available for resources."),
    ).toBeVisible()
    expect(screen.getByText("football · version 1")).toBeVisible()
    expect(addActivity).toHaveBeenCalledWith(businessId, {
      code: "football",
      displayName: "Football",
    })
  })

  it("offers a reload recovery when an optimistic edit is stale", async () => {
    vi.mocked(loadResourceSetup).mockResolvedValue({
      activities: [activity],
      resources: [],
    })
    vi.mocked(changeActivity).mockRejectedValue(
      new ConfigurationApiError(
        "STALE_VERSION",
        "This activity changed after it was loaded.",
      ),
    )
    const user = userEvent.setup()
    render(<ResourceSetup businessId={businessId} venueId={venueId} />)

    await user.click(await screen.findByRole("button", { name: "Deactivate" }))

    expect(await screen.findByText("Configuration changed")).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Reload and try again" }),
    ).toBeVisible()
  })

  it("explains permission denial without retrying a forbidden mutation", async () => {
    vi.mocked(loadResourceSetup).mockRejectedValue(
      new ConfigurationApiError(
        "FORBIDDEN",
        "The requested action is not permitted.",
      ),
    )
    render(<ResourceSetup businessId={businessId} venueId={venueId} />)

    expect(await screen.findByText("Permission required")).toBeVisible()
    expect(
      screen.getByText(
        "An Owner or Manager with configuration access must complete this action.",
      ),
    ).toBeVisible()
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Reload and try again" }),
      ).not.toBeInTheDocument(),
    )
  })
})
