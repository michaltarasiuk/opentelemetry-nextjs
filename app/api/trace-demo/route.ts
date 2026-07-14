import { flattenError } from "zod";

import { TRACE_DEMO_QUERY_SCHEMA } from "@/lib/schemas";
import { runTraceDemo } from "@/lib/trace-demo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = TRACE_DEMO_QUERY_SCHEMA.safeParse({
    scenario: searchParams.get("scenario"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: flattenError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const result = await runTraceDemo(parsed.data.scenario);
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Trace demo failed unexpectedly";

    return Response.json(
      {
        scenario: parsed.data.scenario,
        error: message,
      },
      { status: 500 },
    );
  }
}
