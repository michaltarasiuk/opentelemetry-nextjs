import { SpanStatusCode, trace } from "@opentelemetry/api";

import type { TraceDemoResponse, TraceScenario } from "@/lib/schemas";

const TRACER = trace.getTracer("opentelemetry-nextjs");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function validateRequest(scenario: TraceScenario) {
  return TRACER.startActiveSpan("validateRequest", async (span) => {
    try {
      span.setAttribute("demo.scenario", scenario);
      await sleep(10);
      return true;
    } finally {
      span.end();
    }
  });
}

async function cacheLookup(scenario: TraceScenario) {
  return TRACER.startActiveSpan("cacheLookup", async (span) => {
    try {
      const cacheHit = scenario === "fast";
      span.setAttribute("cache.hit", cacheHit);
      await sleep(cacheHit ? 15 : 40);
      return cacheHit;
    } finally {
      span.end();
    }
  });
}

async function dbQuery(scenario: TraceScenario) {
  return TRACER.startActiveSpan("dbQuery", async (span) => {
    try {
      await sleep(scenario === "slow" || scenario === "error" ? 700 : 20);

      if (scenario === "error") {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Simulated database failure",
        });
        throw new Error("Simulated database failure");
      }

      const rows = 42;
      span.setAttribute("db.rows", rows);
      return rows;
    } finally {
      span.end();
    }
  });
}

async function buildResponse(
  scenario: TraceScenario,
  cacheHit: boolean,
  rows: number | null,
) {
  return TRACER.startActiveSpan("buildResponse", async (span) => {
    try {
      await sleep(20);
      span.setAttribute("demo.scenario", scenario);
      span.setAttribute("cache.hit", cacheHit);
      if (rows !== null) {
        span.setAttribute("db.rows", rows);
      }
    } finally {
      span.end();
    }
  });
}

export async function runTraceDemo(
  scenario: TraceScenario,
): Promise<TraceDemoResponse> {
  const startedAt = Date.now();

  return TRACER.startActiveSpan("runTraceDemo", async (span) => {
    try {
      span.setAttribute("demo.scenario", scenario);

      await validateRequest(scenario);
      const cacheHit = await cacheLookup(scenario);

      let rows: number | null = null;
      if (!cacheHit) {
        rows = await dbQuery(scenario);
      }

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
    } finally {
      span.end();
    }
  });
}
