import { logs, SeverityNumber } from "@opentelemetry/api-logs";

import type { LogDemoResponse, LogScenario } from "@/lib/schemas";

import { sleep } from "@/lib/sleep";

const logger = logs.getLogger("opentelemetry-nextjs");

interface ScenarioProfile {
  delayMs: number;
  message: string;
}

const SCENARIO_PROFILES: Record<LogScenario, ScenarioProfile> = {
  info: {
    delayMs: 20,
    message: "Emitted INFO and DEBUG log records",
  },
  warning: {
    delayMs: 30,
    message: "Emitted WARN log record with structured attributes",
  },
  error: {
    delayMs: 25,
    message: "Emitted ERROR log record with exception context",
  },
};

export async function runLogsDemo(
  scenario: LogScenario,
): Promise<LogDemoResponse> {
  const { delayMs, message } = SCENARIO_PROFILES[scenario];
  const startedAt = Date.now();

  await sleep(delayMs);

  switch (scenario) {
    case "info":
      logger.emit({
        severityNumber: SeverityNumber.DEBUG,
        severityText: "DEBUG",
        body: "Starting logs demo run",
        attributes: {
          "demo.scenario": scenario,
        },
      });
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
        body: "User triggered the logs playground",
        attributes: {
          "demo.scenario": scenario,
          "demo.source": "server",
          "user.action": "logs-playground.run",
        },
      });
      break;

    case "warning":
      logger.emit({
        severityNumber: SeverityNumber.WARN,
        severityText: "WARN",
        body: "Cache miss detected, falling back to slow path",
        attributes: {
          "demo.scenario": scenario,
          "cache.hit": false,
          "fallback.strategy": "database",
        },
      });
      break;

    case "error":
      logger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: "ERROR",
        body: "Simulated processing failure",
        attributes: {
          "demo.scenario": scenario,
          "error.type": "SimulatedError",
          "error.message": "Database connection timed out",
        },
      });
      break;

    default:
      scenario satisfies never;
  }

  const durationMs = Date.now() - startedAt;

  return { scenario, durationMs, message };
}
