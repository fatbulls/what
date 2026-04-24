// Medusa discovers + runs everything in `src/loaders/*`. Importing our
// `src/lib/sentry.ts` here has the side effect of calling `initSentry()`
// at server startup — no further wiring needed inside route handlers.

import "../lib/sentry"
