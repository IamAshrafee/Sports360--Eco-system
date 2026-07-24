import type { Pool } from "pg"
import { z } from "zod"

export const outboxMessageSchema = z.object({
  aggregateId: z.string().min(1),
  aggregateType: z.string().min(1),
  attempts: z.number().int().nonnegative(),
  businessId: z.uuid().nullable(),
  id: z.uuid(),
  payload: z.record(z.string(), z.unknown()),
  topic: z.string().min(1),
})

export type OutboxMessage = z.infer<typeof outboxMessageSchema>

interface OutboxRow {
  aggregate_id: string
  aggregate_type: string
  attempts: number
  business_id: string | null
  id: string
  payload: unknown
  topic: string
}

function mapMessage(row: OutboxRow): OutboxMessage {
  return outboxMessageSchema.parse({
    aggregateId: row.aggregate_id,
    aggregateType: row.aggregate_type,
    attempts: row.attempts,
    businessId: row.business_id,
    id: row.id,
    payload: row.payload,
    topic: row.topic,
  })
}

export class PostgresOutbox {
  constructor(
    private readonly pool: Pool,
    private readonly workerId: string,
  ) {}

  async claim(batchSize = 50): Promise<OutboxMessage[]> {
    const result = await this.pool.query<OutboxRow>(
      "SELECT * FROM app.claim_outbox_messages($1, $2)",
      [this.workerId, batchSize],
    )
    return result.rows.map(mapMessage)
  }

  async complete(messageId: string): Promise<boolean> {
    const result = await this.pool.query<{ completed: boolean }>(
      "SELECT app.complete_outbox_message($1, $2) AS completed",
      [messageId, this.workerId],
    )
    return result.rows[0]?.completed ?? false
  }

  async fail(messageId: string, error: unknown): Promise<boolean> {
    const safeError =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "Unknown error"
    const result = await this.pool.query<{ failed: boolean }>(
      "SELECT app.fail_outbox_message($1, $2, $3) AS failed",
      [messageId, this.workerId, safeError],
    )
    return result.rows[0]?.failed ?? false
  }
}
