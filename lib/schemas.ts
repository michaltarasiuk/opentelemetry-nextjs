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
