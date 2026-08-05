"use client";

import { CircleAlertIcon, PlayIcon } from "lucide-react";
import { use, type ReactNode } from "react";

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
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";

import {
  DemoPlaygroundContext,
  type DemoPlaygroundContextValue,
} from "./context";

export function useDemoPlayground() {
  const value = use(DemoPlaygroundContext);
  if (!value) {
    throw new Error(
      "DemoPlayground components must be used within DemoPlayground.Provider",
    );
  }
  return value;
}

function Provider({
  children,
  state,
  actions,
  meta,
}: DemoPlaygroundContextValue & { children: ReactNode }) {
  return (
    <DemoPlaygroundContext value={{ state, actions, meta }}>
      {children}
    </DemoPlaygroundContext>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return <Card>{children}</Card>;
}

function Header() {
  const { meta } = useDemoPlayground();

  return (
    <CardHeader>
      <CardTitle>{meta.title}</CardTitle>
      <CardDescription>{meta.description}</CardDescription>
    </CardHeader>
  );
}

function Content({ children }: { children: ReactNode }) {
  return (
    <CardContent>
      <FieldGroup>{children}</FieldGroup>
    </CardContent>
  );
}

function ScenarioField({ children }: { children: ReactNode }) {
  const { state, actions } = useDemoPlayground();

  return (
    <Field>
      <FieldTitle>Scenario</FieldTitle>
      <FieldContent>
        <Tabs value={state.scenario} onValueChange={actions.setScenario}>
          {children}
        </Tabs>
      </FieldContent>
    </Field>
  );
}

function Actions({ children }: { children?: ReactNode }) {
  return (
    <CardFooter className="flex-col items-stretch gap-4 border-t">
      <RunButton />
      {children}
      <Response />
    </CardFooter>
  );
}

function RunButton() {
  const { state, actions, meta } = useDemoPlayground();

  return (
    <Button onClick={actions.run} disabled={state.pending}>
      {state.pending ? (
        <>
          <Spinner className="size-4" />
          {meta.runningLabel}
        </>
      ) : (
        <>
          <PlayIcon className="size-4" />
          {meta.runLabel}
        </>
      )}
    </Button>
  );
}

function Response() {
  const { state, meta } = useDemoPlayground();

  if (!state.result && !state.error) {
    return null;
  }

  return (
    <>
      <Separator />
      <Field>
        <FieldTitle>Response</FieldTitle>
        <FieldContent>
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>{meta.errorTitle}</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : (
            <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
              {JSON.stringify(state.result, null, 2)}
            </pre>
          )}
        </FieldContent>
      </Field>
    </>
  );
}

export const DemoPlayground = {
  Provider,
  Frame,
  Header,
  Content,
  ScenarioField,
  Actions,
  RunButton,
  Response,
};

export type {
  DemoPlaygroundActions,
  DemoPlaygroundMeta,
  DemoPlaygroundState,
} from "./context";
