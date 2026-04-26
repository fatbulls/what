import type { MetadataRoute } from "next";
import { sdk } from "@lib/medusa";

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://194.233.77.181:3003";

type WithMeta = { handle?: string; slug?: string; updated_at?: string };

function pickDate(value: unknown): Date {
  if (typeof value === "string" && value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

async function listAllProducts(): Promise<WithMeta[]> {
  try {
    const { products } = await sdk.client.fetch<{ products: WithMeta[] }>(
      "/store/products",
      { query: { limit: 500, fields: "handle,updated_at" } },
    );
    return (products ?? []).filter((p) => p.handle);
  } catch {
    return [];
  }
}

async function listAllCategories(): Promise<WithMeta[]> {
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: WithMeta[];
    }>("/store/product-categories", {
      query: { limit: 200, fields: "handle,updated_at" },
    });
    return (product_categories ?? []).filter((c) => c.handle);
  } catch {
    return [];
  }
}

async function listAllBlogs(): Promise<WithMeta[]> {
  try {
    const { posts } = await sdk.client.fetch<{ posts: WithMeta[] }>(
      "/store/blog-posts",
      { query: { limit: 200, is_published: true } },
    );
    return (posts ?? []).filter((p) => p.slug);
  } catch {
    return [];
  }
}

// CMS pages live at /:slug on the storefront (privacy, terms, future
// about/faq pages). Pulled from the page module so admin-managed pages
// auto-show up in the sitemap.
async function listAllPages(): Promise<WithMeta[]> {
  try {
    const { pages } = await sdk.client.fetch<{ pages: any[] }>(
      "/store/pages",
      { query: { limit: 200 } },
    );
    return (pages ?? [])
      .filter((p: any) => p?.is_published !== false && p?.slug)
      .map((p: any) => ({ slug: p.slug, updated_at: p.updated_at }));
  } catch {
    return [];
  }
}

const STATIC_PATHS = [
  "/",
  "/search",
  "/about-us",
  "/contact-us",
  "/faq",
  "/faq-shipping-delivery",
  "/faq-return-exchanges",
  "/blog",
  "/shops",
  "/order-tracking",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogs, pages] = await Promise.all([
    listAllProducts(),
    listAllCategories(),
    listAllBlogs(),
    listAllPages(),
  ]);

  const now = new Date();
  const seenSlugs = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const p of STATIC_PATHS) {
    entries.push({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: p === "/" ? 1 : 0.6,
    });
  }

  // Top-level CMS pages first so blog detail (also under /:slug) won't
  // double-add the same slug.
  for (const p of pages) {
    if (!p.slug || seenSlugs.has(p.slug)) continue;
    seenSlugs.add(p.slug);
    entries.push({
      url: `${BASE}/${p.slug}`,
      lastModified: pickDate(p.updated_at),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const b of blogs) {
    if (!b.slug || seenSlugs.has(b.slug)) continue;
    seenSlugs.add(b.slug);
    entries.push({
      url: `${BASE}/${b.slug}`,
      lastModified: pickDate(b.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const product of products) {
    entries.push({
      url: `${BASE}/products/${product.handle}`,
      lastModified: pickDate(product.updated_at),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const category of categories) {
    entries.push({
      url: `${BASE}/category/${category.handle}`,
      lastModified: pickDate(category.updated_at),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
