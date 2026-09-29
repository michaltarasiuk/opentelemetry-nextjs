"use client";

import { createContext } from "react";

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

export interface DemoPlaygroundContextValue {
  state: DemoPlaygroundState;
  actions: DemoPlaygroundActions;
}

export const DemoPlaygroundContext =
  createContext<DemoPlaygroundContextValue | null>(null);
