"use client";

import {
  startTransition,
  useActionState,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import type { LogDemoResponse, LogScenario } from "@/lib/schemas";

import { Playground } from "@/components/playground";
import { FieldDescription } from "@/components/ui/field";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runLogsDemoAction } from "@/lib/actions";
import { recordBrowserClick } from "@/lib/metrics.client";
import { LOG_SCENARIO_SCHEMA } from "@/lib/schemas";
import { withMinimumDelay } from "@/lib/sleep";

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
    <Playground.Provider
      state={{
        scenario,
        pending,
        result: runState.result,
        error: runState.error,
      }}
      actions={{ setScenario: selectScenario, run }}
    >
      {children}
    </Playground.Provider>
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
    <Playground.Frame>
      <Playground.Header
        title="Logs playground"
        description="Emit structured log records at various severity levels to your collector."
      />
      <Playground.Content>
        <Playground.ScenarioField>
          <LogsScenarioTabs />
        </Playground.ScenarioField>
      </Playground.Content>
      <Playground.Actions>
        <Playground.RunButton pendingLabel="Emitting…">
          Emit logs
        </Playground.RunButton>
        <Playground.Response>
          <Playground.ErrorAlert title="Log emission failed" />
          <Playground.Result pendingLabel="Emitting…" />
        </Playground.Response>
      </Playground.Actions>
    </Playground.Frame>
  );
}

export function LogsPlayground() {
  return (
    <LogsPlaygroundProvider>
      <LogsPlaygroundFrame />
    </LogsPlaygroundProvider>
  );
}
