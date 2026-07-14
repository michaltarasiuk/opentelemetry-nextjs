import { trace } from "@opentelemetry/api"

import { setupBrowserTelemetry } from "./lib/telemetry.client"

void setupBrowserTelemetry().catch((error) => {
  console.error("Browser telemetry init failed", error)
})

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  trace
    .getTracer("opentelemetry-nextjs-router")
    .startActiveSpan("route.change", (span) => {
      span.setAttribute("route.url", url)
      span.setAttribute("route.type", navigationType)
      span.end()
    })
}
