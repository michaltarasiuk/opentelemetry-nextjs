"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import type { DemoPlaygroundMeta } from "@/components/demo-playground";
import type { MetricDemoResponse, MetricScenario } from "@/lib/schemas";

import { DemoPlayground } from "@/components/demo-playground";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMetricsDemoAction } from "@/lib/actions";
import { recordBrowserClick } from "@/lib/metrics.client";
import { METRIC_SCENARIO_SCHEMA } from "@/lib/schemas";
import { withMinimumDelay } from "@/lib/sleep";

const META: DemoPlaygroundMeta = {
  title: "Metrics playground",
  description:
    "Emit server counters and histograms, plus a browser click counter, to your collector.",
  runLabel: "Record metrics",
  runningLabel: "Recording…",
  errorTitle: "Metrics run failed",
};

interface SessionTotals {
  runs: number;
  requestsRecorded: number;
  cacheDelta: number;
}

interface MetricsRunState {
  result: MetricDemoResponse | null;
  error: string | null;
  totals: SessionTotals;
}

const INITIAL_RUN_STATE: MetricsRunState = {
  result: null,
  error: null,
  totals: {
    runs: 0,
    requestsRecorded: 0,
    cacheDelta: 0,
  },
};

const MetricsSessionContext = createContext<SessionTotals | null>(null);

async function reduceMetricsRun(
  previous: MetricsRunState,
  scenario: MetricScenario,
): Promise<MetricsRunState> {
  const { totals } = previous;

  try {
    const result = await withMinimumDelay(runMetricsDemoAction(scenario));
    toast.success(`Metrics recorded in ${result.durationMs}ms`);
    return {
      result,
      error: null,
      totals: {
        runs: totals.runs + 1,
        requestsRecorded: totals.requestsRecorded + result.requestsRecorded,
        cacheDelta: totals.cacheDelta + result.cacheDelta,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Metrics demo request failed";
    toast.error(message);
    return {
      result: null,
      error: message,
      totals: {
        ...totals,
        runs: totals.runs + 1,
      },
    };
  }
}

function MetricsPlaygroundProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<MetricScenario>("increment");
  const [runState, dispatchRun, pending] = useActionState(
    reduceMetricsRun,
    INITIAL_RUN_STATE,
  );

  function selectScenario(value: string) {
    const parsed = METRIC_SCENARIO_SCHEMA.safeParse(value);
    if (parsed.success) {
      setScenario(parsed.data);
    }
  }

  function run() {
    recordBrowserClick("metrics-playground.run");
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
      <MetricsSessionContext value={runState.totals}>
        {children}
      </MetricsSessionContext>
    </DemoPlayground.Provider>
  );
}

function MetricsScenarioTabs() {
  return (
    <>
      <TabsList>
        <TabsTrigger value="increment">Increment</TabsTrigger>
        <TabsTrigger value="batch">Batch</TabsTrigger>
        <TabsTrigger value="error">Error</TabsTrigger>
      </TabsList>
      <TabsContent value="increment">
        <FieldDescription>
          Records one demo.requests counter, a small duration histogram, and +1
          cache delta.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="batch">
        <FieldDescription>
          Records five request counters and a larger cache delta in one export
          window.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="error">
        <FieldDescription>
          Still records metrics, then fails so you can compare error rates with
          successful runs.
        </FieldDescription>
      </TabsContent>
    </>
  );
}

function MetricsSessionTotals() {
  const totals = use(MetricsSessionContext);
  if (!totals) {
    throw new Error(
      "MetricsSessionTotals must be used within MetricsPlaygroundProvider",
    );
  }

  return (
    <Field>
      <FieldTitle>Session totals</FieldTitle>
      <FieldContent>
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Runs</dt>
            <dd className="font-medium tabular-nums">{totals.runs}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Requests</dt>
            <dd className="font-medium tabular-nums">
              {totals.requestsRecorded}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cache</dt>
            <dd className="font-medium tabular-nums">{totals.cacheDelta}</dd>
          </div>
        </dl>
        <FieldDescription>
          Local UI feedback. Collector export interval is ~5s.
        </FieldDescription>
      </FieldContent>
    </Field>
  );
}

function MetricsPlaygroundFrame() {
  return (
    <DemoPlayground.Frame>
      <DemoPlayground.Header />
      <DemoPlayground.Content>
        <DemoPlayground.ScenarioField>
          <MetricsScenarioTabs />
        </DemoPlayground.ScenarioField>
        <MetricsSessionTotals />
      </DemoPlayground.Content>
      <DemoPlayground.Actions />
    </DemoPlayground.Frame>
  );
}

export function MetricsPlayground() {
  return (
    <MetricsPlaygroundProvider>
      <MetricsPlaygroundFrame />
    </MetricsPlaygroundProvider>
  );
}
