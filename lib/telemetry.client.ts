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

// The web SDK is large and only ever needed in the browser, so it stays out of
// the main bundle behind dynamic imports.
async function initialiseBrowserTelemetry() {
  const { metrics } = await import("@opentelemetry/api");
  const { WebTracerProvider } = await import("@opentelemetry/sdk-trace-web");
  const { BatchSpanProcessor } = await import("@opentelemetry/sdk-trace-base");
  const { OTLPTraceExporter } =
    await import("@opentelemetry/exporter-trace-otlp-http");
  const { OTLPMetricExporter } =
    await import("@opentelemetry/exporter-metrics-otlp-http");
  const { MeterProvider, PeriodicExportingMetricReader } =
    await import("@opentelemetry/sdk-metrics");
  const { resourceFromAttributes } = await import("@opentelemetry/resources");
  const { ATTR_SERVICE_NAME } =
    await import("@opentelemetry/semantic-conventions");
  const { ZoneContextManager } = await import("@opentelemetry/context-zone");
  const { registerInstrumentations } =
    await import("@opentelemetry/instrumentation");
  const { getWebAutoInstrumentations } =
    await import("@opentelemetry/auto-instrumentations-web");

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });

  const { origin } = window.location;

  const tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${origin}/api/otel/v1/traces` }),
      ),
    ],
  });

  tracerProvider.register({ contextManager: new ZoneContextManager() });

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
