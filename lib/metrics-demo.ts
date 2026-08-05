import { metrics } from "@opentelemetry/api";

import type { MetricDemoResponse, MetricScenario } from "@/lib/schemas";

import { sleep } from "@/lib/sleep";

const meter = metrics.getMeter("opentelemetry-nextjs");

const requestCounter = meter.createCounter("demo.requests", {
  description: "Number of demo metric requests recorded",
  unit: "1",
});

const durationHistogram = meter.createHistogram("demo.duration_ms", {
  description: "Demo metric scenario duration",
  unit: "ms",
});

const cacheGauge = meter.createUpDownCounter("demo.cache_entries", {
  description: "Simulated cache entry delta from demo scenarios",
  unit: "1",
});

interface ScenarioProfile {
  requestsRecorded: number;
  cacheDelta: number;
  delayMs: number;
  message: string;
}

const SCENARIO_PROFILES: Record<MetricScenario, ScenarioProfile> = {
  increment: {
    requestsRecorded: 1,
    cacheDelta: 1,
    delayMs: 25,
    message: "Recorded a single request counter and cache delta",
  },
  batch: {
    requestsRecorded: 5,
    cacheDelta: 3,
    delayMs: 80,
    message: "Recorded a batch of counter and cache deltas",
  },
  error: {
    requestsRecorded: 1,
    cacheDelta: -1,
    delayMs: 40,
    message: "Recorded metrics before failing",
  },
};

export async function runMetricsDemo(
  scenario: MetricScenario,
): Promise<MetricDemoResponse> {
  const { requestsRecorded, cacheDelta, delayMs, message } =
    SCENARIO_PROFILES[scenario];
  const startedAt = Date.now();

  await sleep(delayMs);

  requestCounter.add(requestsRecorded, {
    "demo.scenario": scenario,
    "demo.source": "server",
  });

  cacheGauge.add(cacheDelta, { "demo.scenario": scenario });

  const durationMs = Date.now() - startedAt;

  durationHistogram.record(durationMs, { "demo.scenario": scenario });

  // The error scenario deliberately records its metrics first, so the run shows
  // up in the counters that the failure-rate comparison depends on.
  if (scenario === "error") {
    throw new Error("Simulated metrics demo failure");
  }

  return { scenario, durationMs, requestsRecorded, cacheDelta, message };
}
