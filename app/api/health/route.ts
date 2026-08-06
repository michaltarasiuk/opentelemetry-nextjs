import { metrics } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

import type { HealthResponse } from "@/lib/schemas";

import { env } from "@/env";

const logger = logs.getLogger("opentelemetry-nextjs");

const healthCheckCounter = metrics
  .getMeter("opentelemetry-nextjs")
  .createCounter("demo.health.checks", {
    description: "Number of health endpoint checks",
    unit: "1",
  });

export async function GET() {
  healthCheckCounter.add(1, { "http.route": "/api/health" });

  logger.emit({
    severityNumber: SeverityNumber.DEBUG,
    severityText: "DEBUG",
    body: "Health check polled",
    attributes: { "http.route": "/api/health" },
  });

  const body: HealthResponse = {
    status: "ok",
    service: env.OTEL_SERVICE_NAME,
  };

  // A cached health check would report liveness of a past request, and the
  // browser poll would stop reaching the counter above.
  return Response.json(body, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
