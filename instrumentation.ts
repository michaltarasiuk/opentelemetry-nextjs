import { registerOTel } from "@vercel/otel";

import { env } from "./env";

export function register() {
  if (env.OTEL_EXPORTER_OTLP_AUTHORIZATION) {
    process.env.OTEL_EXPORTER_OTLP_HEADERS ??= `authorization=${env.OTEL_EXPORTER_OTLP_AUTHORIZATION}`;
  }

  registerOTel({ serviceName: env.OTEL_SERVICE_NAME });
}
