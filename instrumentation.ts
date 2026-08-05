import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { registerOTel } from "@vercel/otel";

import { env } from "./env";

export function register() {
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??= env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (env.OTEL_EXPORTER_OTLP_AUTHORIZATION) {
    process.env.OTEL_EXPORTER_OTLP_HEADERS ??= `authorization=${encodeURIComponent(env.OTEL_EXPORTER_OTLP_AUTHORIZATION)}`;
  }

  registerOTel({
    serviceName: env.OTEL_SERVICE_NAME,
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 5_000,
      }),
    ],
  });
}
