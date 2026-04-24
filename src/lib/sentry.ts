import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

// Initialize once per process. Safe to call repeatedly — Sentry dedupes.
let _inited = false
export function initSentry() {
  if (_inited) return
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? "0"),
    integrations: [nodeProfilingIntegration()],
    ignoreErrors: [
      // Noise from health probes
      /ECONNRESET/,
      /EPIPE/,
    ],
  })
  _inited = true
}

initSentry()

export { Sentry }
