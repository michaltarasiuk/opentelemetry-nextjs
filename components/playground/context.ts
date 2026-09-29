"use client";

import { createContext } from "react";

export interface PlaygroundState {
  scenario: string;
  pending: boolean;
  result: unknown;
  error: string | null;
}

export interface PlaygroundActions {
  setScenario: (scenario: string) => void;
  run: () => void;
}

export interface PlaygroundContextValue {
  state: PlaygroundState;
  actions: PlaygroundActions;
}

export const PlaygroundContext = createContext<PlaygroundContextValue | null>(
  null,
);
