import { metrics, trace } from "@opentelemetry/api";
import { wrapTracer } from "@opentelemetry/api/experimental";
import { logs } from "@opentelemetry/api-logs";

import { env } from "@/env";

export function getTracer(name = env.OTEL_SERVICE_NAME) {
  return wrapTracer(trace.getTracer(name));
}

export function getMeter(name = env.OTEL_SERVICE_NAME) {
  return metrics.getMeter(name);
}

export function getLogger(name = env.OTEL_SERVICE_NAME) {
  return logs.getLogger(name);
}
