import { randomUUID } from "node:crypto"

import { Queue } from "bullmq"
import { Redis } from "ioredis"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { BullMqJobPublisher } from "./dispatcher.js"
import type { OutboxMessage } from "./outbox.js"

const connection = new Redis(
  process.env.VALKEY_URL ?? "redis://localhost:56379",
  { maxRetriesPerRequest: null },
)
const queueName = `sports-integration-${randomUUID()}`
const queue = new Queue<OutboxMessage>(queueName, { connection })

beforeAll(async () => {
  await queue.waitUntilReady()
})

afterAll(async () => {
  await queue.obliterate({ force: true })
  await queue.close()
  connection.disconnect()
})

describe("BullMQ durability contract", () => {
  it("deduplicates repeated publication by outbox message ID", async () => {
    const publisher = new BullMqJobPublisher(queue)
    const message: OutboxMessage = {
      aggregateId: "booking-1",
      aggregateType: "booking",
      attempts: 1,
      businessId: "019b7000-0000-7000-8000-000000000001",
      id: randomUUID(),
      payload: { bookingId: "booking-1" },
      topic: "booking.created",
    }

    await publisher.publish(message)
    await publisher.publish(message)

    expect(await queue.getJobCounts("wait")).toMatchObject({ wait: 1 })
    expect((await queue.getJob(message.id))?.data).toEqual(message)
  })
})
