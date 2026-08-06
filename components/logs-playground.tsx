"use client";

import { startTransition, useActionState, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type { DemoPlaygroundMeta } from "@/components/demo-playground";
import type { LogDemoResponse, LogScenario } from "@/lib/schemas";

import { DemoPlayground } from "@/components/demo-playground";
import { FieldDescription } from "@/components/ui/field";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runLogsDemoAction } from "@/lib/actions";
import { recordBrowserClick } from "@/lib/metrics.client";
import { LOG_SCENARIO_SCHEMA } from "@/lib/schemas";
import { withMinimumDelay } from "@/lib/sleep";

const META: DemoPlaygroundMeta = {
  title: "Logs playground",
  description:
    "Emit structured log records at various severity levels to your collector.",
  runLabel: "Emit logs",
  runningLabel: "Emitting…",
  errorTitle: "Log emission failed",
};

interface LogsRunState {
  result: LogDemoResponse | null;
  error: string | null;
}

const INITIAL_RUN_STATE: LogsRunState = {
  result: null,
  error: null,
};

async function reduceLogsRun(
  _previous: LogsRunState,
  scenario: LogScenario,
): Promise<LogsRunState> {
  try {
    const result = await withMinimumDelay(runLogsDemoAction(scenario));
    toast.success(`Logs emitted in ${result.durationMs}ms`);
    return {
      result,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logs demo request failed";
    toast.error(message);
    return {
      result: null,
      error: message,
    };
  }
}

function LogsPlaygroundProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<LogScenario>("info");
  const [runState, dispatchRun, pending] = useActionState(
    reduceLogsRun,
    INITIAL_RUN_STATE,
  );

  function selectScenario(value: string) {
    const parsed = LOG_SCENARIO_SCHEMA.safeParse(value);
    if (parsed.success) {
      setScenario(parsed.data);
    }
  }

  function run() {
    recordBrowserClick("logs-playground.run");
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

function LogsScenarioTabs() {
  return (
    <>
      <TabsList>
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="warning">Warning</TabsTrigger>
        <TabsTrigger value="error">Error</TabsTrigger>
      </TabsList>
      <TabsContent value="info">
        <FieldDescription>
          Emits a DEBUG record followed by an INFO record with structured
          attributes.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="warning">
        <FieldDescription>
          Emits a WARN record with cache-miss context and fallback strategy
          attributes.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="error">
        <FieldDescription>
          Emits an ERROR record with exception type and message attributes.
        </FieldDescription>
      </TabsContent>
    </>
  );
}

function LogsPlaygroundFrame() {
  return (
    <DemoPlayground.Frame>
      <DemoPlayground.Header />
      <DemoPlayground.Content>
        <DemoPlayground.ScenarioField>
          <LogsScenarioTabs />
        </DemoPlayground.ScenarioField>
      </DemoPlayground.Content>
      <DemoPlayground.Actions />
    </DemoPlayground.Frame>
  );
}

export function LogsPlayground() {
  return (
    <LogsPlaygroundProvider>
      <LogsPlaygroundFrame />
    </LogsPlaygroundProvider>
  );
}
