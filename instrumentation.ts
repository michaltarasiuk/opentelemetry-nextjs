import { registerOTel } from "@vercel/otel";

import { env } from "./env";

export function register() {
  registerOTel({ serviceName: env.OTEL_SERVICE_NAME });
}
