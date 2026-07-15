"use client";

import { CircleAlertIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TraceDemoResponse, TraceScenario } from "@/lib/schemas";
import { runTraceDemo } from "@/lib/trace-demo";

export function TracePlayground() {
  const [scenario, setScenario] = useState<TraceScenario>("fast");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TraceDemoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTrace() {
    setLoading(true);
    setError(null);

    try {
      const result = await runTraceDemo(scenario);

      setResult(result);
      toast.success(`Trace completed in ${result.durationMs}ms`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Trace demo request failed";

      setResult(null);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trace playground</CardTitle>
        <CardDescription>
          Trigger scenarios from the browser to generate linked client and
          server spans.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldTitle>Scenario</FieldTitle>
            <FieldContent>
              <Tabs
                value={scenario}
                onValueChange={(value) => setScenario(value as TraceScenario)}
              >
                <TabsList>
                  <TabsTrigger value="fast">Fast</TabsTrigger>
                  <TabsTrigger value="slow">Slow</TabsTrigger>
                  <TabsTrigger value="error">Error</TabsTrigger>
                </TabsList>
                <TabsContent value="fast">
                  <FieldDescription>
                    Cache hit with short delays — validateRequest, cacheLookup,
                    buildResponse.
                  </FieldDescription>
                </TabsContent>
                <TabsContent value="slow">
                  <FieldDescription>
                    Cache miss with a simulated DB query — compare latency in
                    your collector.
                  </FieldDescription>
                </TabsContent>
                <TabsContent value="error">
                  <FieldDescription>
                    Fails inside dbQuery — HTTP 500 with a failed span status.
                  </FieldDescription>
                </TabsContent>
              </Tabs>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-4 border-t">
        <Button onClick={() => void runTrace()} disabled={loading}>
          {loading ? (
            <>
              <Spinner className="size-4" />
              Running…
            </>
          ) : (
            <>
              <PlayIcon className="size-4" />
              Run trace
            </>
          )}
        </Button>

        {(result || error) && (
          <>
            <Separator />
            <Field>
              <FieldTitle>Response</FieldTitle>
              <FieldContent>
                {error ? (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Trace failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </FieldContent>
            </Field>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
