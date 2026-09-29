import { trace } from "@opentelemetry/api";

import { env } from "./env";
import { recordRouteChange } from "./lib/metrics.client";
import { setupBrowserTelemetry } from "./lib/telemetry.client";

void setupBrowserTelemetry().catch((error) => {
  console.error("Browser telemetry init failed", error);
});

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  recordRouteChange(navigationType);

  trace
    .getTracer(`${env.NEXT_PUBLIC_OTEL_SERVICE_NAME}-router`)
    .startActiveSpan("route.change", (span) => {
      span.setAttribute("route.url", url);
      span.setAttribute("route.type", navigationType);
      span.end();
    });
}
