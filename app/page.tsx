import type { ReactNode } from "react";

import {
  ActivityIcon,
  ArrowRightIcon,
  GaugeIcon,
  RadioIcon,
} from "lucide-react";
import Link from "next/link";

import { HealthStatus } from "@/components/health-status";
import { TracePlayground } from "@/components/trace-playground";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { runTraceDemo } from "@/lib/trace-demo";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint: string;
}

function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <CardAction>
          <span className="text-muted-foreground">{icon}</span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const warmup = await runTraceDemo("fast");

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Server OTel</Badge>
            <Badge variant="secondary">Browser OTel</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              OpenTelemetry Dashboard
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Explore server and browser tracing in Next.js. Run demo scenarios
              and inspect linked spans in your collector.
            </p>
          </div>
        </header>

        <Separator />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<ActivityIcon className="size-4" />}
            label="Warmup trace"
            value={`${warmup.durationMs}ms`}
            hint={`Server-rendered ${warmup.scenario} scenario on page load.`}
          />
          <StatCard
            icon={<GaugeIcon className="size-4" />}
            label="Cache status"
            value={warmup.cacheHit ? "Hit" : "Miss"}
            hint={warmup.message}
          />
          <StatCard
            icon={<RadioIcon className="size-4" />}
            label="Service health"
            value={<HealthStatus />}
            hint="Polled from the browser via /api/health."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TracePlayground />
          </div>

          <aside className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation demo</CardTitle>
                <CardDescription>
                  Emit a route.change span on client navigation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/traces"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full",
                  )}
                >
                  Go to /traces
                  <ArrowRightIcon className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}
