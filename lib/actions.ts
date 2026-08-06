"use server";

import { logs, SeverityNumber } from "@opentelemetry/api-logs";

import { runLogsDemo } from "@/lib/logs-demo";
import { runMetricsDemo } from "@/lib/metrics-demo";
import {
  LOG_SCENARIO_SCHEMA,
  METRIC_SCENARIO_SCHEMA,
  TRACE_SCENARIO_SCHEMA,
} from "@/lib/schemas";
import { runTraceDemo } from "@/lib/trace-demo";

const logger = logs.getLogger("opentelemetry-nextjs");

export async function runTraceDemoAction(scenario: unknown) {
  const parsed = TRACE_SCENARIO_SCHEMA.safeParse(scenario);
  if (!parsed.success) {
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: "WARN",
      body: "Invalid trace scenario received",
      attributes: {
        action: "runTraceDemoAction",
        input: String(scenario),
      },
    });
    throw new Error("Unknown trace scenario");
  }

  return runTraceDemo(parsed.data);
}

export async function runMetricsDemoAction(scenario: unknown) {
  const parsed = METRIC_SCENARIO_SCHEMA.safeParse(scenario);
  if (!parsed.success) {
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: "WARN",
      body: "Invalid metrics scenario received",
      attributes: {
        action: "runMetricsDemoAction",
        input: String(scenario),
      },
    });
    throw new Error("Unknown metrics scenario");
  }

  return runMetricsDemo(parsed.data);
}

export async function runLogsDemoAction(scenario: unknown) {
  const parsed = LOG_SCENARIO_SCHEMA.safeParse(scenario);
  if (!parsed.success) {
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: "WARN",
      body: "Invalid log scenario received",
      attributes: {
        action: "runLogsDemoAction",
        input: String(scenario),
      },
    });
    throw new Error("Unknown log scenario");
  }

  return runLogsDemo(parsed.data);
}
