import { env } from "@/env";

// This route forwards browser telemetry with the collector's credentials
// attached, so the caller-supplied path is matched against a fixed set of OTLP
// signal paths rather than resolved into the collector's URL space.
const OTLP_SIGNAL_PATHS = new Set(["v1/traces", "v1/metrics", "v1/logs"]);

// A base URL without a trailing slash would drop its last path segment when
// the signal path is resolved against it.
const COLLECTOR_BASE_URL = env.OTEL_EXPORTER_OTLP_ENDPOINT.endsWith("/")
  ? env.OTEL_EXPORTER_OTLP_ENDPOINT
  : `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/`;

export async function POST(
  request: Request,
  context: RouteContext<"/api/otel/[...path]">,
) {
  const { path } = await context.params;
  const signalPath = path.join("/");

  if (!OTLP_SIGNAL_PATHS.has(signalPath)) {
    return new Response(null, { status: 404 });
  }

  const headers = new Headers();
  if (env.OTEL_EXPORTER_OTLP_HEADERS) {
    for (const [name, value] of parseRawHeaders(
      env.OTEL_EXPORTER_OTLP_HEADERS,
    )) {
      headers.set(name, value);
    }
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const response = await fetch(new URL(signalPath, COLLECTOR_BASE_URL), {
    method: "POST",
    headers,
    body: await request.arrayBuffer(),
  });

  // Only the content type is echoed back. Upstream hop-by-hop headers such as
  // content-encoding and content-length no longer describe this response.
  const responseHeaders = new Headers({ "cache-control": "no-store" });
  const responseContentType = response.headers.get("content-type");
  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

function parseRawHeaders(rawHeaders: string) {
  return rawHeaders
    .split(",")
    .map((header) => header.split("=") as [string, string]);
}
