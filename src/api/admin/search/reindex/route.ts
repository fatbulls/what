import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  MEILI_PRODUCTS_INDEX,
  getMeiliClient,
  ensureProductsIndex,
  productToDoc,
} from "../../../../lib/meilisearch"

// Full product backfill. Deletes the existing Meili index and rebuilds it
// from whatever's currently in Postgres. Safe to run any time — search is
// briefly empty while the task finishes (Meili indexes in ~seconds for
// typical catalogs).
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const client = getMeiliClient()
  if (!client) {
    res.status(503).json({ message: "search not configured" })
    return
  }

  const productModule = req.scope.resolve(Modules.PRODUCT) as any
  const BATCH = 100
  let offset = 0
  let total = 0

  try {
    await client.deleteIndexIfExists(MEILI_PRODUCTS_INDEX)
  } catch {}
  const index = await ensureProductsIndex()
  if (!index) {
    res.status(500).json({ message: "failed to create index" })
    return
  }

  while (true) {
    const batch = await productModule.listProducts(
      {},
      {
        take: BATCH,
        skip: offset,
        relations: [
          "variants",
          "variants.prices",
          "tags",
          "categories",
          "images",
        ],
      },
    )
    if (!batch.length) break
    await index.addDocuments(batch.map(productToDoc))
    total += batch.length
    offset += BATCH
    if (batch.length < BATCH) break
  }

  res.json({ message: `Reindexed ${total} products`, total })
}
