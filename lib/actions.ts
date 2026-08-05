"use server";

import type { MetricDemoResponse, TraceDemoResponse } from "@/lib/schemas";

import { runMetricsDemo } from "@/lib/metrics-demo";
import { METRIC_SCENARIO_SCHEMA, TRACE_SCENARIO_SCHEMA } from "@/lib/schemas";
import { runTraceDemo } from "@/lib/trace-demo";

// Every export here is reachable as a public POST endpoint, not just through
// the UI, so arguments are parsed rather than trusted.

export async function runTraceDemoAction(
  scenario: unknown,
): Promise<TraceDemoResponse> {
  const parsed = TRACE_SCENARIO_SCHEMA.safeParse(scenario);
  if (!parsed.success) {
    throw new Error("Unknown trace scenario");
  }

  return runTraceDemo(parsed.data);
}

export async function runMetricsDemoAction(
  scenario: unknown,
): Promise<MetricDemoResponse> {
  const parsed = METRIC_SCENARIO_SCHEMA.safeParse(scenario);
  if (!parsed.success) {
    throw new Error("Unknown metrics scenario");
  }

  return runMetricsDemo(parsed.data);
}
