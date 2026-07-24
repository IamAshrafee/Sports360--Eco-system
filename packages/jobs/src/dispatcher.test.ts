import { describe, expect, it, vi } from "vitest"

import { dispatchOutboxBatch, type JobPublisher } from "./dispatcher.js"
import type { OutboxMessage } from "./outbox.js"

const message: OutboxMessage = {
  aggregateId: "booking-1",
  aggregateType: "booking",
  attempts: 1,
  businessId: "019b7000-0000-7000-8000-000000000001",
  id: "019b7000-0000-7000-8000-000000000501",
  payload: { bookingId: "booking-1" },
  topic: "booking.created",
}

describe("outbox dispatcher", () => {
  it("marks a message complete only after queue publication succeeds", async () => {
    const outbox = {
      claim: vi.fn().mockResolvedValue([message]),
      complete: vi.fn().mockResolvedValue(true),
      fail: vi.fn(),
    }
    const publisher: JobPublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
    }

    await dispatchOutboxBatch(outbox as never, publisher)

    expect(publisher.publish).toHaveBeenCalledWith(message)
    expect(outbox.complete).toHaveBeenCalledWith(message.id)
    expect(outbox.fail).not.toHaveBeenCalled()
  })

  it("releases a failed message for durable retry", async () => {
    const error = new Error("queue unavailable")
    const outbox = {
      claim: vi.fn().mockResolvedValue([message]),
      complete: vi.fn(),
      fail: vi.fn().mockResolvedValue(true),
    }
    const publisher: JobPublisher = {
      publish: vi.fn().mockRejectedValue(error),
    }

    await dispatchOutboxBatch(outbox as never, publisher)

    expect(outbox.complete).not.toHaveBeenCalled()
    expect(outbox.fail).toHaveBeenCalledWith(message.id, error)
  })
})
