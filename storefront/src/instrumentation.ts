// Next.js runs this once per runtime (nodejs / edge) when the server boots.
// Sentry v10 requires init to happen inside `register()` instead of
// sentry.server.config.ts.
import { baseInit } from "@lib/sentry";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") baseInit();
  if (process.env.NEXT_RUNTIME === "edge") baseInit();
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
