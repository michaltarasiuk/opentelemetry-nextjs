"use client";

import { createContext } from "react";

export interface PlaygroundContextValue {
  state: {
    scenario: string;
    execution: {
      pending: boolean;
      result: unknown;
      error: string | null;
    };
  };
  actions: {
    setScenario: (scenario: string) => void;
    run: () => void;
  };
}

export type PlaygroundState = PlaygroundContextValue["state"];
export type PlaygroundActions = PlaygroundContextValue["actions"];
export type PlaygroundExecution = PlaygroundState["execution"];

export const PlaygroundContext = createContext<PlaygroundContextValue | null>(
  null,
);
