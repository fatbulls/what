// Best-effort fire-and-forget hit on the storefront's /api/revalidate webhook.
// Used by admin write handlers (site-config, menu, pages, blog-posts) so the
// storefront's ISR cache flushes immediately on save instead of waiting for
// the soft revalidate window (5–60s).
//
// Failures are swallowed: storefront unreachable, secret mismatch, etc. should
// never break an admin save. The cache will self-heal on its own TTL anyway.

const STOREFRONT_URL =
  process.env.STOREFRONT_REVALIDATE_URL ??
  process.env.STOREFRONT_URL ??
  "http://127.0.0.1:3003"
const SECRET = process.env.REVALIDATE_SECRET ?? ""

type Targets = { tags?: string[]; paths?: string[] }

export function revalidateStorefront(targets: Targets): void {
  if (!SECRET) return
  const params = new URLSearchParams()
  params.set("secret", SECRET)
  for (const t of targets.tags ?? []) params.append("tag", t)
  for (const p of targets.paths ?? []) params.append("path", p)
  const url = `${STOREFRONT_URL.replace(/\/$/, "")}/api/revalidate?${params.toString()}`

  // Fire and forget — don't await. Keep a tight timeout so a hung storefront
  // can't slow down admin saves; warn on non-2xx so misconfig is visible.
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 2000)
  fetch(url, { method: "POST", signal: ctrl.signal })
    .then((r) => {
      if (!r.ok) {
        console.warn(
          `[revalidate-storefront] ${r.status} for ${targets.tags?.join(",")}`,
        )
      }
    })
    .catch(() => {
      // Storefront unreachable — fall back to soft revalidate window.
    })
    .finally(() => clearTimeout(timeout))
}
