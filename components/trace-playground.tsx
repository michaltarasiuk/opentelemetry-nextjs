"use client";

import {
  startTransition,
  useActionState,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import type { DemoPlaygroundMeta } from "@/components/demo-playground";
import type { TraceDemoResponse, TraceScenario } from "@/lib/schemas";

import { DemoPlayground } from "@/components/demo-playground";
import { FieldDescription } from "@/components/ui/field";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runTraceDemoAction } from "@/lib/actions";
import { recordBrowserClick } from "@/lib/metrics.client";
import { TRACE_SCENARIO_SCHEMA } from "@/lib/schemas";

const META: DemoPlaygroundMeta = {
  title: "Trace playground",
  description:
    "Trigger scenarios from the browser to generate linked client and server spans.",
  runLabel: "Run trace",
  runningLabel: "Running…",
  errorTitle: "Trace failed",
};

interface TraceRunState {
  result: TraceDemoResponse | null;
  error: string | null;
}

const INITIAL_RUN_STATE: TraceRunState = {
  result: null,
  error: null,
};

async function reduceTraceRun(
  _previous: TraceRunState,
  scenario: TraceScenario,
): Promise<TraceRunState> {
  try {
    const result = await runTraceDemoAction(scenario);
    toast.success(`Trace completed in ${result.durationMs}ms`);
    return {
      result,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Trace demo request failed";
    toast.error(message);
    return {
      result: null,
      error: message,
    };
  }
}

function TracePlaygroundProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<TraceScenario>("fast");
  const [runState, dispatchRun, pending] = useActionState(
    reduceTraceRun,
    INITIAL_RUN_STATE,
  );

  function selectScenario(value: string) {
    const parsed = TRACE_SCENARIO_SCHEMA.safeParse(value);
    if (parsed.success) {
      setScenario(parsed.data);
    }
  }

  function run() {
    recordBrowserClick("trace-playground.run");
    startTransition(() => dispatchRun(scenario));
  }

  return (
    <DemoPlayground.Provider
      state={{
        scenario,
        pending,
        result: runState.result,
        error: runState.error,
      }}
      actions={{ setScenario: selectScenario, run }}
      meta={META}
    >
      {children}
    </DemoPlayground.Provider>
  );
}

function TraceScenarioTabs() {
  return (
    <>
      <TabsList>
        <TabsTrigger value="fast">Fast</TabsTrigger>
        <TabsTrigger value="slow">Slow</TabsTrigger>
        <TabsTrigger value="error">Error</TabsTrigger>
      </TabsList>
      <TabsContent value="fast">
        <FieldDescription>
          Cache hit with short delays across validateRequest, cacheLookup, and
          buildResponse.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="slow">
        <FieldDescription>
          Cache miss with a simulated DB query. Compare latency in your
          collector.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="error">
        <FieldDescription>
          Fails inside dbQuery, returning HTTP 500 with a failed span status.
        </FieldDescription>
      </TabsContent>
    </>
  );
}

function TracePlaygroundFrame() {
  return (
    <DemoPlayground.Frame>
      <DemoPlayground.Header />
      <DemoPlayground.Content>
        <DemoPlayground.ScenarioField>
          <TraceScenarioTabs />
        </DemoPlayground.ScenarioField>
      </DemoPlayground.Content>
      <DemoPlayground.Actions />
    </DemoPlayground.Frame>
  );
}

export function TracePlayground() {
  return (
    <TracePlaygroundProvider>
      <TracePlaygroundFrame />
    </TracePlaygroundProvider>
  );
}
