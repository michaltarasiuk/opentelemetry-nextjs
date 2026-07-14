import { env } from "@/env";

export async function GET() {
  return Response.json({
    status: "ok",
    service: env.OTEL_SERVICE_NAME,
  });
}
