import type { MetadataRoute } from "next";
import { sdk } from "@lib/medusa";

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://194.233.77.181:3003";

async function listAllProductHandles(): Promise<string[]> {
  try {
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      { query: { limit: 500, fields: "handle" } }
    );
    return (products ?? []).map((p) => p.handle).filter(Boolean);
  } catch {
    return [];
  }
}

async function listAllCategoryHandles(): Promise<string[]> {
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: any[];
    }>("/store/product-categories", {
      query: { limit: 200, fields: "handle" },
    });
    return (product_categories ?? []).map((c) => c.handle).filter(Boolean);
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
  "/privacy",
  "/terms",
  "/blog",
  "/shops",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    listAllProductHandles(),
    listAllCategoryHandles(),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const p of STATIC_PATHS) {
    entries.push({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: p === "/" ? 1 : 0.6,
    });
  }
  for (const handle of products) {
    entries.push({
      url: `${BASE}/products/${handle}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }
  for (const handle of categories) {
    entries.push({
      url: `${BASE}/category/${handle}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  return entries;
}
