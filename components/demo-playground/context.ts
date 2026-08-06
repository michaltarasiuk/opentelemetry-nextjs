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
