import { randomUUID } from "node:crypto"

import {
  BullMqJobPublisher,
  dispatchOutboxBatch,
  PostgresOutbox,
} from "@sports/jobs"
import { createLogger, startObservability } from "@sports/observability"
import { createPool } from "@sports/persistence"
import { Queue } from "bullmq"
import { Redis } from "ioredis"
import { z } from "zod"

import { createWorkerHeartbeat } from "./heartbeat.js"

const workerEnvironmentSchema = z.object({
  DATABASE_RUNTIME_URL: z
    .url()
    .default(
      "postgresql://sports_runtime:sports_runtime_local@localhost:55432/sports_management",
    ),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
  OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().min(250).default(2_000),
  VALKEY_URL: z.url().default("redis://localhost:56379"),
  WORKER_HEARTBEAT_INTERVAL_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .default(30_000),
})

const config = workerEnvironmentSchema.parse(process.env)
const workerId = `worker-${randomUUID()}`
const logger = createLogger({ level: config.LOG_LEVEL, service: "worker" })
const observability = await startObservability({
  endpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
  serviceName: "sports-worker",
})
const database = createPool(config.DATABASE_RUNTIME_URL)
const valkey = new Redis(config.VALKEY_URL, { maxRetriesPerRequest: null })
const queue = new Queue("sports-outbound", { connection: valkey })
const outbox = new PostgresOutbox(database, workerId)
const publisher = new BullMqJobPublisher(queue)

logger.info({ workerId }, "worker started")

const heartbeat = setInterval(() => {
  logger.info(createWorkerHeartbeat(new Date()), "worker heartbeat")
}, config.WORKER_HEARTBEAT_INTERVAL_MS)

const pollOutbox = async () => {
  const claimed = await dispatchOutboxBatch(outbox, publisher)
  if (claimed > 0) {
    logger.info({ claimed }, "outbox batch dispatched")
  }
}

const outboxPoll = setInterval(() => {
  void pollOutbox().catch((error: unknown) => {
    logger.error({ error }, "outbox dispatch failed")
  })
}, config.OUTBOX_POLL_INTERVAL_MS)

const shutdown = async (signal: NodeJS.Signals) => {
  clearInterval(heartbeat)
  clearInterval(outboxPoll)
  await Promise.all([queue.close(), database.end(), observability.shutdown()])
  valkey.disconnect()
  logger.info({ signal }, "worker stopped")
}

process.once("SIGINT", () => {
  void shutdown("SIGINT")
})
process.once("SIGTERM", () => {
  void shutdown("SIGTERM")
})
