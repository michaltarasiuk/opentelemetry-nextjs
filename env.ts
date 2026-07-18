import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    OTEL_SERVICE_NAME: z.string(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
    OTEL_EXPORTER_OTLP_AUTHORIZATION: z.string().optional(),
    NEXT_OTEL_VERBOSE: z.enum(["0", "1"]).transform((value) => value === "1"),
  },
  client: {
    NEXT_PUBLIC_OTEL_SERVICE_NAME: z.string(),
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: z.literal("/api/otel"),
  },
  runtimeEnv: {
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_EXPORTER_OTLP_AUTHORIZATION:
      process.env.OTEL_EXPORTER_OTLP_AUTHORIZATION,
    NEXT_OTEL_VERBOSE: process.env.NEXT_OTEL_VERBOSE,
    NEXT_PUBLIC_OTEL_SERVICE_NAME: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT:
      process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
