import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MEILI_PRODUCTS_INDEX, getMeiliClient } from "../../../lib/meilisearch"

// Public search endpoint the storefront calls. We don't expose the Meili
// master key to the browser — the storefront hits /store/search, Medusa
// proxies the query with the server-side key, returns only the display
// fields.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const client = getMeiliClient()
  if (!client) {
    res.status(503).json({ hits: [], message: "search not configured" })
    return
  }
  const q = String((req.query as any).q ?? "").trim()
  const limit = Math.min(Number((req.query as any).limit ?? 12), 50)
  const offset = Math.max(Number((req.query as any).offset ?? 0), 0)
  const filter = (req.query as any).filter as string | undefined

  try {
    const index = client.index(MEILI_PRODUCTS_INDEX)
    const results = await index.search(q, {
      limit,
      offset,
      filter,
      attributesToHighlight: ["title", "description"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    })
    res.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=30, stale-while-revalidate=120",
    )
    res.json({
      hits: results.hits,
      estimated_total: results.estimatedTotalHits,
      query: results.query,
      processing_time_ms: results.processingTimeMs,
      limit,
      offset,
    })
  } catch (err) {
    res.status(500).json({ hits: [], message: (err as Error).message })
  }
}
