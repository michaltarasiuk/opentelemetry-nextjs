import { metrics, SpanStatusCode, trace, type Span } from "@opentelemetry/api";

import type { TraceDemoResponse, TraceScenario } from "@/lib/schemas";

import { sleep } from "@/lib/sleep";

const tracer = trace.getTracer("opentelemetry-nextjs");
const meter = metrics.getMeter("opentelemetry-nextjs");

const traceDemoCounter = meter.createCounter("demo.trace.runs", {
  description: "Number of trace demo runs",
  unit: "1",
});

/**
 * Ends the span on every path, and marks it failed with the thrown exception
 * so a failed run is visible in the collector rather than looking like a
 * successful span that simply stopped early.
 */
async function withSpan<T>(name: string, fn: (span: Span) => Promise<T>) {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await fn(span);
    } catch (error) {
      let message: string | undefined;
      if (error instanceof Error) {
        span.recordException(error);
        message = error.message;
      }
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

function validateRequest(scenario: TraceScenario) {
  return withSpan("validateRequest", async (span) => {
    span.setAttribute("demo.scenario", scenario);
    await sleep(10);
  });
}

function cacheLookup(scenario: TraceScenario) {
  return withSpan("cacheLookup", async (span) => {
    const cacheHit = scenario === "fast";
    span.setAttribute("cache.hit", cacheHit);
    await sleep(cacheHit ? 15 : 40);
    return cacheHit;
  });
}

function dbQuery(scenario: TraceScenario) {
  return withSpan("dbQuery", async (span) => {
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
  return withSpan("buildResponse", async (span) => {
    await sleep(20);
    span.setAttribute("demo.scenario", scenario);
    span.setAttribute("cache.hit", cacheHit);
    if (rows !== null) {
      span.setAttribute("db.rows", rows);
    }
  });
}

export function runTraceDemo(
  scenario: TraceScenario,
): Promise<TraceDemoResponse> {
  return withSpan("runTraceDemo", async (span) => {
    const startedAt = Date.now();

    span.setAttribute("demo.scenario", scenario);
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
  });
}
