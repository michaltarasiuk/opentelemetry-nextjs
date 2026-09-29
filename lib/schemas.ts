import { z } from "zod";

export const TRACE_SCENARIOS = ["fast", "slow", "error"] as const;
export type TraceScenario = (typeof TRACE_SCENARIOS)[number];
export const TRACE_SCENARIO_SCHEMA = z.enum(TRACE_SCENARIOS);

export type TraceDemoResponse = {
  scenario: TraceScenario;
  durationMs: number;
  cacheHit: boolean;
  rows: number | null;
  message: string;
};

export const METRIC_SCENARIOS = ["increment", "batch", "error"] as const;
export type MetricScenario = (typeof METRIC_SCENARIOS)[number];
export const METRIC_SCENARIO_SCHEMA = z.enum(METRIC_SCENARIOS);

export type MetricDemoResponse = {
  scenario: MetricScenario;
  durationMs: number;
  requestsRecorded: number;
  cacheDelta: number;
  message: string;
};

export const LOG_SCENARIOS = ["info", "warning", "error"] as const;
export type LogScenario = (typeof LOG_SCENARIOS)[number];
export const LOG_SCENARIO_SCHEMA = z.enum(LOG_SCENARIOS);

export type LogDemoResponse = {
  scenario: LogScenario;
  durationMs: number;
  message: string;
};

export const HEALTH_RESPONSE_SCHEMA = z.object({
  status: z.literal("ok"),
  service: z.string(),
});

export type HealthResponse = z.infer<typeof HEALTH_RESPONSE_SCHEMA>;
