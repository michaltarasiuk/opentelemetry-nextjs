import { env } from "@/env"

export async function POST(
  request: Request,
  context: RouteContext<"/api/otel/[...path]">,
) {
  const { path } = await context.params
  const targetPath = path.join("/")
  const body = await request.arrayBuffer()

  const targetUrl = new URL(targetPath, env.OTEL_EXPORTER_OTLP_ENDPOINT)

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body,
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
