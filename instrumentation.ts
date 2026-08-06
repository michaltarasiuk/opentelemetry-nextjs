import type { LogRecordProcessor } from "@opentelemetry/sdk-logs";

import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { registerOTel } from "@vercel/otel";

import { env } from "./env";

export function register() {
  const logRecordProcessors: LogRecordProcessor[] = [
    new BatchLogRecordProcessor({
      exporter: new OTLPLogExporter(),
    }),
  ];
  if (env.NODE_ENV === "development") {
    logRecordProcessors.push(
      new SimpleLogRecordProcessor({
        exporter: new ConsoleLogRecordExporter(),
      }),
    );
  }

  registerOTel({
    serviceName: env.OTEL_SERVICE_NAME,
    logRecordProcessors,
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 5_000,
      }),
    ],
  });
}
