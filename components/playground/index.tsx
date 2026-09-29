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

import { isDefined } from "@/lib/utils";

import { PlaygroundContext, type PlaygroundContextValue } from "./context";

export function usePlayground() {
  const value = use(PlaygroundContext);
  if (!isDefined(value)) {
    throw new Error(
      "Playground components must be used within Playground.Provider",
    );
  }
  return value;
}

function Provider({
  children,
  state,
  actions,
}: PlaygroundContextValue & { children: ReactNode }) {
  return (
    <PlaygroundContext value={{ state, actions }}>{children}</PlaygroundContext>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return <Card>{children}</Card>;
}

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
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
  const { state, actions } = usePlayground();

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

function Actions({ children }: { children: ReactNode }) {
  return (
    <CardFooter className="flex-col items-stretch gap-4 border-t">
      {children}
    </CardFooter>
  );
}

function RunButton({
  children,
  pendingLabel,
}: {
  children: ReactNode;
  pendingLabel: string;
}) {
  const { state, actions } = usePlayground();

  return (
    <Button onClick={actions.run} disabled={state.pending}>
      {state.pending ? (
        <>
          <Spinner className="size-4" />
          {pendingLabel}
        </>
      ) : (
        <>
          <PlayIcon className="size-4" />
          {children}
        </>
      )}
    </Button>
  );
}

function Response({ children }: { children: ReactNode }) {
  const { state } = usePlayground();

  if (!state.pending && !isDefined(state.result) && !isDefined(state.error)) {
    return null;
  }

  return (
    <>
      <Separator />
      <Field>
        <FieldTitle>Response</FieldTitle>
        <FieldContent>{children}</FieldContent>
      </Field>
    </>
  );
}

function ErrorAlert({ title }: { title: string }) {
  const { state } = usePlayground();

  if (!isDefined(state.error)) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{state.error}</AlertDescription>
    </Alert>
  );
}

function Result({ pendingLabel }: { pendingLabel: string }) {
  const { state } = usePlayground();

  if (state.error) {
    return null;
  }

  return (
    <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
      {isDefined(state.result) ? (
        JSON.stringify(state.result, null, 2)
      ) : (
        <span className="text-muted-foreground">{pendingLabel}</span>
      )}
    </pre>
  );
}

export const Playground = {
  Provider,
  Frame,
  Header,
  Content,
  ScenarioField,
  Actions,
  RunButton,
  Response,
  ErrorAlert,
  Result,
};

export type { PlaygroundActions, PlaygroundState } from "./context";
