import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions"
import { z } from "zod"

const telemetryConfigurationSchema = z.object({
  endpoint: z.url().optional(),
  serviceName: z.string().min(1),
})

export interface ObservabilityLifecycle {
  enabled: boolean
  shutdown(): Promise<void>
}

export async function startObservability(
  input: z.input<typeof telemetryConfigurationSchema>,
): Promise<ObservabilityLifecycle> {
  const configuration = telemetryConfigurationSchema.parse(input)

  if (configuration.endpoint === undefined) {
    return {
      enabled: false,
      shutdown: async () => undefined,
    }
  }

  const endpoint = configuration.endpoint.replace(/\/$/, "")
  const sdk = new NodeSDK({
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
      }),
    }),
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: configuration.serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
  })

  await Promise.resolve(sdk.start())

  return {
    enabled: true,
    shutdown: async () => sdk.shutdown(),
  }
}
