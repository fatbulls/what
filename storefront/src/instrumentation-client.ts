// Runs in the browser after hydration.
import * as Sentry from "@sentry/nextjs";
import { baseInit } from "@lib/sentry";

baseInit({
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
