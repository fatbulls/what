// Shared Sentry config shape + guard. Called from server / client / edge
// init entrypoints so one source of truth governs sample rates and
// filters.
import * as Sentry from "@sentry/nextjs";

export function baseInit(extra: Parameters<typeof Sentry.init>[0] = {}) {
  const dsn =
    process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1",
    ),
    replaysOnErrorSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_REPLAY_ERROR_RATE ?? "1.0",
    ),
    replaysSessionSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_RATE ?? "0",
    ),
    ignoreErrors: [
      /ResizeObserver loop/,
      /Non-Error promise rejection captured/,
      /Network request failed/,
    ],
    ...extra,
  });
}
