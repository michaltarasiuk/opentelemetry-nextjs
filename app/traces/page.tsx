import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TracesPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Navigation tracing</CardTitle>
            <CardDescription>
              This page demonstrates client-side route change spans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Navigating here triggered{" "}
              <code className="code-inline">onRouterTransitionStart</code> in{" "}
              <code className="code-inline">instrumentation-client.ts</code>,
              emitting a <code className="code-inline">route.change</code> span
              in your collector.
            </p>
          </CardContent>
          <CardFooter className="border-t">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <ArrowLeftIcon className="size-4" />
              Back to dashboard
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
