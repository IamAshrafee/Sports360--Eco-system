export interface WorkerHeartbeat {
  emittedAt: string
  service: "worker"
  status: "alive"
}

export function createWorkerHeartbeat(now: Date): WorkerHeartbeat {
  return {
    emittedAt: now.toISOString(),
    service: "worker",
    status: "alive",
  }
}
