"use client";

import { useEffect, useState } from "react";

import type { HealthResponse } from "@/lib/schemas";

import { Spinner } from "@/components/ui/spinner";
import { HEALTH_RESPONSE_SCHEMA } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 15_000;

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function check() {
      // A backgrounded dashboard should stop emitting health spans.
      if (document.hidden) {
        return;
      }

      try {
        const response = await fetch("/api/health", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Health check returned ${response.status}`);
        }

        setHealth(HEALTH_RESPONSE_SCHEMA.parse(await response.json()));
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        setHealth(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void check();
    const interval = setInterval(() => void check(), POLL_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <span
      className="flex h-8 items-center"
      aria-busy={loading}
      aria-live="polite"
    >
      {loading ? (
        <Spinner className="size-5 text-muted-foreground" />
      ) : (
        <span
          className={cn(
            "capitalize tabular-nums",
            !health && "text-destructive",
          )}
        >
          {health ? health.status : "Degraded"}
        </span>
      )}
    </span>
  );
}
