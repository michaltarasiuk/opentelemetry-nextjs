import { registerOTel } from "@vercel/otel";

import { env } from "./env";

export function register() {
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??= env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (env.OTEL_EXPORTER_OTLP_AUTHORIZATION) {
    process.env.OTEL_EXPORTER_OTLP_HEADERS ??= `authorization=${encodeURIComponent(env.OTEL_EXPORTER_OTLP_AUTHORIZATION)}`;
  }

  registerOTel({ serviceName: env.OTEL_SERVICE_NAME });
}
