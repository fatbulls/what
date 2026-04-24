import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import {
  MEILI_PRODUCTS_INDEX,
  getMeiliClient,
  ensureProductsIndex,
  productToDoc,
} from "../lib/meilisearch"

// Keeps the Meilisearch products index in sync with Medusa product mutations.
// Fires on create / update / delete from the Product module.

async function upsertById(container: any, ids: string[]) {
  const client = getMeiliClient()
  if (!client) return
  await ensureProductsIndex()
  const productModule = container.resolve(Modules.PRODUCT)
  const products = await productModule.listProducts(
    { id: ids },
    {
      relations: ["variants", "variants.prices", "tags", "categories", "images"],
    },
  )
  if (!products.length) return
  await client.index(MEILI_PRODUCTS_INDEX).addDocuments(products.map(productToDoc))
}

async function removeById(ids: string[]) {
  const client = getMeiliClient()
  if (!client) return
  await client.index(MEILI_PRODUCTS_INDEX).deleteDocuments(ids)
}

export default async function productSearchHandler({
  event,
  container,
}: SubscriberArgs<{ id?: string; ids?: string[] }>) {
  try {
    const raw = event.data as any
    const ids = Array.isArray(raw?.ids)
      ? raw.ids
      : raw?.id
      ? [raw.id]
      : []
    if (!ids.length) return

    if (event.name.endsWith(".deleted")) {
      await removeById(ids)
    } else {
      await upsertById(container, ids)
    }
  } catch (err) {
    const logger = container.resolve("logger") as any
    logger?.warn?.(`[search-index] failed: ${(err as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
