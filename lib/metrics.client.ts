import { metrics, type Counter } from "@opentelemetry/api";

import { env } from "@/env";

let clickCounter: Counter | null = null;
let routeChangeCounter: Counter | null = null;

function getBrowserMeter() {
  return metrics.getMeter(env.NEXT_PUBLIC_OTEL_SERVICE_NAME);
}

export function recordBrowserClick(target: string) {
  clickCounter ??= getBrowserMeter().createCounter("demo.ui.clicks", {
    description: "Browser UI clicks in the demo dashboard",
    unit: "1",
  });

  clickCounter.add(1, { "ui.target": target });
}

export function recordRouteChange(navigationType: string) {
  routeChangeCounter ??= getBrowserMeter().createCounter("demo.route.changes", {
    description: "Client-side route transitions",
    unit: "1",
  });

  routeChangeCounter.add(1, { "route.type": navigationType });
}
