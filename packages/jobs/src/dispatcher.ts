import type { JobsOptions, Queue } from "bullmq"

import type { OutboxMessage, PostgresOutbox } from "./outbox.js"

export interface JobPublisher {
  publish(message: OutboxMessage): Promise<void>
}

export class BullMqJobPublisher implements JobPublisher {
  constructor(
    private readonly queue: Queue<OutboxMessage>,
    private readonly options: JobsOptions = {
      attempts: 5,
      backoff: { delay: 5_000, type: "exponential" },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    },
  ) {}

  async publish(message: OutboxMessage): Promise<void> {
    await this.queue.add(message.topic, message, {
      ...this.options,
      jobId: message.id,
    })
  }
}

export async function dispatchOutboxBatch(
  outbox: PostgresOutbox,
  publisher: JobPublisher,
  batchSize = 50,
): Promise<number> {
  const messages = await outbox.claim(batchSize)

  for (const message of messages) {
    try {
      await publisher.publish(message)
      await outbox.complete(message.id)
    } catch (error) {
      await outbox.fail(message.id, error)
    }
  }

  return messages.length
}
