import { env } from "@/env";

let initialised = false;

export async function setupBrowserTelemetry() {
  if (initialised || typeof window === "undefined") {
    return;
  }

  try {
    const { WebTracerProvider } = await import("@opentelemetry/sdk-trace-web");
    const { BatchSpanProcessor } =
      await import("@opentelemetry/sdk-trace-base");
    const { OTLPTraceExporter } =
      await import("@opentelemetry/exporter-trace-otlp-http");
    const { resourceFromAttributes } = await import("@opentelemetry/resources");
    const { ATTR_SERVICE_NAME } =
      await import("@opentelemetry/semantic-conventions");
    const { ZoneContextManager } = await import("@opentelemetry/context-zone");
    const { registerInstrumentations } =
      await import("@opentelemetry/instrumentation");
    const { getWebAutoInstrumentations } =
      await import("@opentelemetry/auto-instrumentations-web");

    const endpoint = `${window.location.origin}/api/otel/v1/traces`;

    const provider = new WebTracerProvider({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
      }),
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: endpoint,
          }),
        ),
      ],
    });

    provider.register({
      contextManager: new ZoneContextManager(),
    });

    const propagateTo = [/^\//, new RegExp(window.location.origin)];

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

    initialised = true;
  } catch (error) {
    initialised = false;
    throw error;
  }
}
