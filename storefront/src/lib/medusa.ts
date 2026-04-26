import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server.
// `NEXT_PUBLIC_*` is required for the browser bundle — plain
// `MEDUSA_BACKEND_URL` is stripped in client code and the SDK would silently
// fall back to `http://localhost:9000` (the user's machine, not the server).
let MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  process.env.MEDUSA_BACKEND_URL ??
  "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // Cross-subdomain setup (what.com.my → admin.what.com.my) + Cloudflare in
  // the middle means cookie-based sessions don't round-trip reliably. JWT is
  // stored in localStorage and sent as Authorization header, so the session
  // survives regardless of SameSite/Secure cookie quirks.
  auth: { type: "jwt" },
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
