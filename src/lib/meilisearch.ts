import { Meilisearch, type Index } from "meilisearch"

// Shared client + small helpers for the `products` index. The index is kept
// flat (one doc per product) for instant-search latency; variants are joined
// in as an array field so partial matches on SKU/title still work.

export const MEILI_PRODUCTS_INDEX = "products"

let _client: Meilisearch | null = null
export function getMeiliClient(): Meilisearch | null {
  if (_client) return _client
  const host = process.env.MEILISEARCH_HOST
  const apiKey = process.env.MEILISEARCH_API_KEY
  if (!host) return null
  _client = new Meilisearch({ host, apiKey })
  return _client
}

export async function ensureProductsIndex(): Promise<Index | null> {
  const client = getMeiliClient()
  if (!client) return null
  const index = client.index(MEILI_PRODUCTS_INDEX)
  // Idempotent settings update. Meili merges; only missing fields are added.
  try {
    await client.createIndex(MEILI_PRODUCTS_INDEX, { primaryKey: "id" })
  } catch {
    // Index already exists — fine.
  }
  await index.updateSettings({
    searchableAttributes: [
      "title",
      "description",
      "subtitle",
      "handle",
      "tags",
      "category_names",
      "variant_titles",
      "variant_skus",
    ],
    filterableAttributes: [
      "status",
      "category_ids",
      "tag_ids",
      "tags",
      "handle",
    ],
    sortableAttributes: ["created_at", "updated_at", "title"],
    displayedAttributes: [
      "id",
      "title",
      "subtitle",
      "handle",
      "description",
      "thumbnail",
      "images",
      "tags",
      "category_names",
      "category_ids",
      "status",
      "created_at",
      "updated_at",
      "variant_titles",
      "variant_skus",
      "min_price",
      "max_price",
    ],
  })
  return index
}

export type ProductDoc = {
  id: string
  title: string
  subtitle?: string | null
  handle?: string | null
  description?: string | null
  thumbnail?: string | null
  images?: string[]
  status?: string | null
  tags?: string[]
  tag_ids?: string[]
  category_names?: string[]
  category_ids?: string[]
  variant_titles?: string[]
  variant_skus?: string[]
  min_price?: number | null
  max_price?: number | null
  created_at?: string
  updated_at?: string
}

export function productToDoc(p: any): ProductDoc {
  const variants = Array.isArray(p.variants) ? p.variants : []
  const prices = variants
    .flatMap((v: any) => v.prices ?? [])
    .map((pr: any) => Number(pr.amount))
    .filter((n: number) => Number.isFinite(n))
  return {
    id: String(p.id),
    title: String(p.title ?? ""),
    subtitle: p.subtitle ?? null,
    handle: p.handle ?? null,
    description: p.description ?? null,
    thumbnail: p.thumbnail ?? null,
    images: Array.isArray(p.images) ? p.images.map((img: any) => img.url).filter(Boolean) : [],
    status: p.status ?? null,
    tags: Array.isArray(p.tags) ? p.tags.map((t: any) => t.value).filter(Boolean) : [],
    tag_ids: Array.isArray(p.tags) ? p.tags.map((t: any) => t.id).filter(Boolean) : [],
    category_names: Array.isArray(p.categories) ? p.categories.map((c: any) => c.name).filter(Boolean) : [],
    category_ids: Array.isArray(p.categories) ? p.categories.map((c: any) => c.id).filter(Boolean) : [],
    variant_titles: variants.map((v: any) => v.title).filter(Boolean),
    variant_skus: variants.map((v: any) => v.sku).filter(Boolean),
    min_price: prices.length ? Math.min(...prices) : null,
    max_price: prices.length ? Math.max(...prices) : null,
    created_at: p.created_at ? new Date(p.created_at).toISOString() : undefined,
    updated_at: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
  }
}
