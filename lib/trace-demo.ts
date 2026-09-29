import type { TraceDemoResponse, TraceScenario } from "@/lib/schemas";

import { sleep } from "@/lib/sleep";
import { getMeter, getTracer } from "@/lib/telemetry";
import { isDefined } from "@/lib/utils";

const tracer = getTracer();
const meter = getMeter();

const traceDemoCounter = meter.createCounter("demo.trace.runs", {
  description: "Number of trace demo runs",
  unit: "1",
});

function validateRequest(scenario: TraceScenario) {
  return tracer.withActiveSpan(
    "validateRequest",
    { attributes: { "demo.scenario": scenario } },
    async () => {
      await sleep(10);
    },
  );
}

function cacheLookup(scenario: TraceScenario) {
  const cacheHit = scenario === "fast";

  return tracer.withActiveSpan(
    "cacheLookup",
    { attributes: { "cache.hit": cacheHit } },
    async () => {
      await sleep(cacheHit ? 15 : 40);
      return cacheHit;
    },
  );
}

function dbQuery(scenario: TraceScenario) {
  return tracer.withActiveSpan("dbQuery", async (span) => {
    await sleep(scenario === "fast" ? 20 : 700);

    if (scenario === "error") {
      throw new Error("Simulated database failure");
    }

    const rows = 42;
    span.setAttribute("db.rows", rows);
    return rows;
  });
}

function buildResponse(
  scenario: TraceScenario,
  cacheHit: boolean,
  rows: number | null,
) {
  return tracer.withActiveSpan(
    "buildResponse",
    {
      attributes: {
        "demo.scenario": scenario,
        "cache.hit": cacheHit,
        ...(isDefined(rows) ? { "db.rows": rows } : {}),
      },
    },
    async () => {
      await sleep(20);
    },
  );
}

export function runTraceDemo(
  scenario: TraceScenario,
): Promise<TraceDemoResponse> {
  return tracer.withActiveSpan(
    "runTraceDemo",
    { attributes: { "demo.scenario": scenario } },
    async (span) => {
      const startedAt = Date.now();

      traceDemoCounter.add(1, { "demo.scenario": scenario });

      await validateRequest(scenario);
      const cacheHit = await cacheLookup(scenario);
      const rows = cacheHit ? null : await dbQuery(scenario);

      await buildResponse(scenario, cacheHit, rows);

      const durationMs = Date.now() - startedAt;
      span.setAttribute("demo.duration_ms", durationMs);

      return {
        scenario,
        durationMs,
        cacheHit,
        rows,
        message: cacheHit ? "Served from cache" : "Query completed",
      };
    },
  );
}
