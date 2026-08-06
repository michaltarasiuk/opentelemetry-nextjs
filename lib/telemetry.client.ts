import type { LogRecordProcessor } from "@opentelemetry/sdk-logs";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";

import { defaultResource } from "@opentelemetry/resources";

import { env } from "@/env";

let setup: Promise<void> | null = null;

/**
 * Registering the web SDK twice would install a second set of instrumentations
 * and double-report every span, so concurrent callers share one in-flight
 * attempt. A failed attempt is cleared so a later call can retry.
 */
export function setupBrowserTelemetry(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  setup ??= initialiseBrowserTelemetry().catch((error: unknown) => {
    setup = null;
    throw error;
  });

  return setup;
}

async function initialiseBrowserTelemetry() {
  const { metrics } = await import("@opentelemetry/api");
  const { logs } = await import("@opentelemetry/api-logs");
  const { getWebAutoInstrumentations } =
    await import("@opentelemetry/auto-instrumentations-web");
  const { ZoneContextManager } = await import("@opentelemetry/context-zone");
  const { OTLPLogExporter } =
    await import("@opentelemetry/exporter-logs-otlp-http");
  const { OTLPMetricExporter } =
    await import("@opentelemetry/exporter-metrics-otlp-http");
  const { OTLPTraceExporter } =
    await import("@opentelemetry/exporter-trace-otlp-http");
  const { registerInstrumentations } =
    await import("@opentelemetry/instrumentation");
  const { resourceFromAttributes } = await import("@opentelemetry/resources");
  const {
    LoggerProvider,
    BatchLogRecordProcessor,
    SimpleLogRecordProcessor,
    ConsoleLogRecordExporter,
  } = await import("@opentelemetry/sdk-logs");
  const { MeterProvider, PeriodicExportingMetricReader } =
    await import("@opentelemetry/sdk-metrics");
  const { ATTR_SERVICE_NAME } =
    await import("@opentelemetry/semantic-conventions");
  const { BatchSpanProcessor } = await import("@opentelemetry/sdk-trace-base");
  const { WebTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } =
    await import("@opentelemetry/sdk-trace-web");

  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    }),
  );

  const { origin } = window.location;

  const spanProcessors: SpanProcessor[] = [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${origin}/api/otel/v1/traces`,
      }),
    ),
  ];
  if (env.NODE_ENV === "development") {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  const tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors,
  });

  tracerProvider.register({
    contextManager: new ZoneContextManager(),
  });

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${origin}/api/otel/v1/metrics`,
        }),
        exportIntervalMillis: 5_000,
      }),
    ],
  });

  metrics.setGlobalMeterProvider(meterProvider);

  const logProcessors: LogRecordProcessor[] = [
    new BatchLogRecordProcessor({
      exporter: new OTLPLogExporter({
        url: `${origin}/api/otel/v1/logs`,
      }),
    }),
  ];
  if (env.NODE_ENV === "development") {
    logProcessors.push(
      new SimpleLogRecordProcessor({
        exporter: new ConsoleLogRecordExporter(),
      }),
    );
  }

  const loggerProvider = new LoggerProvider({
    resource,
    processors: logProcessors,
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  // Relative URLs, plus absolute URLs back to this same origin. The origin is
  // escaped because it contains regex metacharacters such as "." and ":".
  const propagateTo = [
    /^\//,
    new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
  ];

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-fetch": {
          propagateTraceHeaderCorsUrls: propagateTo,
          clearTimingResources: true,
        },
        "@opentelemetry/instrumentation-xml-http-request": {
          propagateTraceHeaderCorsUrls: propagateTo,
        },
        "@opentelemetry/instrumentation-document-load": {},
        "@opentelemetry/instrumentation-user-interaction": {
          eventNames: ["click", "submit"],
        },
      }),
    ],
  });
}
