import { z } from "zod";

export const TRACE_SCENARIO_SCHEMA = z.enum(["fast", "slow", "error"]);
export type TraceScenario = z.infer<typeof TRACE_SCENARIO_SCHEMA>;

export const TRACE_DEMO_RESPONSE_SCHEMA = z.object({
  scenario: TRACE_SCENARIO_SCHEMA,
  durationMs: z.number().int().nonnegative(),
  cacheHit: z.boolean(),
  rows: z.number().int().nonnegative().nullable(),
  message: z.string(),
});

export type TraceDemoResponse = z.infer<typeof TRACE_DEMO_RESPONSE_SCHEMA>;

export const METRIC_SCENARIO_SCHEMA = z.enum(["increment", "batch", "error"]);
export type MetricScenario = z.infer<typeof METRIC_SCENARIO_SCHEMA>;

export const METRIC_DEMO_RESPONSE_SCHEMA = z.object({
  scenario: METRIC_SCENARIO_SCHEMA,
  durationMs: z.number().int().nonnegative(),
  requestsRecorded: z.number().int().positive(),
  cacheDelta: z.number().int(),
  message: z.string(),
});

export type MetricDemoResponse = z.infer<typeof METRIC_DEMO_RESPONSE_SCHEMA>;

export const LOG_SCENARIO_SCHEMA = z.enum(["info", "warning", "error"]);
export type LogScenario = z.infer<typeof LOG_SCENARIO_SCHEMA>;

export const LOG_DEMO_RESPONSE_SCHEMA = z.object({
  scenario: LOG_SCENARIO_SCHEMA,
  durationMs: z.number().int().nonnegative(),
  message: z.string(),
});

export type LogDemoResponse = z.infer<typeof LOG_DEMO_RESPONSE_SCHEMA>;

export const HEALTH_RESPONSE_SCHEMA = z.object({
  status: z.literal("ok"),
  service: z.string(),
});

export type HealthResponse = z.infer<typeof HEALTH_RESPONSE_SCHEMA>;
