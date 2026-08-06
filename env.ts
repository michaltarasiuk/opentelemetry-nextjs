import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    OTEL_SERVICE_NAME: z.string(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
    OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_OTEL_SERVICE_NAME: z.string(),
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: z.string().startsWith("/"),
  },
  runtimeEnv: {
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
    NEXT_PUBLIC_OTEL_SERVICE_NAME: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT:
      process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT,
  },
  emptyStringAsUndefined: true,
});
