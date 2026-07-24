import type { ActorContext } from "@sports/contracts"
import { describe, expect, it } from "vitest"

import {
  AuthorizationError,
  requirePermission,
  requireVenueAccess,
} from "./index.js"

const venueA = "019b7000-0000-7000-8000-000000000201"
const actor: ActorContext = {
  accessVersion: 0,
  allowedVenueIds: [venueA],
  businessId: "019b7000-0000-7000-8000-000000000001",
  businessWide: false,
  correlationId: "test",
  membershipId: "019b7000-0000-7000-8000-000000000101",
  permissions: ["booking.read", "booking.create"],
  profileCode: "BOOKING_STAFF",
  sessionVersion: 0,
  userId: "019b7000-0000-7000-8000-000000000011",
}

describe("application authorization", () => {
  it("allows only explicitly granted permissions", () => {
    expect(() => requirePermission(actor, "booking.create")).not.toThrow()
    expect(() => requirePermission(actor, "payment.refund")).toThrow(
      AuthorizationError,
    )
  })

  it("enforces selected-venue scope", () => {
    expect(() => requireVenueAccess(actor, venueA)).not.toThrow()
    expect(() =>
      requireVenueAccess(actor, "019b7000-0000-7000-8000-000000000999"),
    ).toThrow(AuthorizationError)
  })
})
