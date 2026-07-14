"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface HealthResponse {
  status: string;
  service: string;
}

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignored = false;

    async function fetchHealth() {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Health check failed");
        }

        const data = (await response.json()) as HealthResponse;
        if (!ignored) {
          setHealth(data);
        }
      } catch {
        if (!ignored) {
          setHealth(null);
        }
      } finally {
        if (!ignored) {
          setLoading(false);
        }
      }
    }

    void fetchHealth();

    return () => {
      ignored = true;
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
