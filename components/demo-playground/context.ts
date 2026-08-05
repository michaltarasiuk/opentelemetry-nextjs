"use client";

import { createContext } from "react";

/**
 * The shared playground chrome only ever renders the scenario as a tab value
 * and the result as formatted JSON, so the context deliberately holds the
 * widened types. Each feature keeps its own narrow scenario union locally and
 * widens on the way in, which keeps this contract free of unchecked casts.
 */
export interface DemoPlaygroundState {
  scenario: string;
  pending: boolean;
  result: unknown;
  error: string | null;
}

export interface DemoPlaygroundActions {
  setScenario: (scenario: string) => void;
  run: () => void;
}

export interface DemoPlaygroundMeta {
  title: string;
  description: string;
  runLabel: string;
  runningLabel: string;
  errorTitle: string;
}

export interface DemoPlaygroundContextValue {
  state: DemoPlaygroundState;
  actions: DemoPlaygroundActions;
  meta: DemoPlaygroundMeta;
}

export const DemoPlaygroundContext =
  createContext<DemoPlaygroundContextValue | null>(null);
