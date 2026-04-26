import type { Metadata } from "next";
import SearchClient from "./page-client";
import { sdk } from "@lib/medusa";

export const revalidate = 60;

// Faceted-URL noindex policy. Bare /search and free-text /search?q=…
// are indexable (real landing pages a user would naturally search for).
// Anything else — category/brand/price/orderBy filters — is a thin
// duplicate of a proper /category/<handle> page and gets noindex,follow
// to avoid index bloat without sacrificing link equity.
//
// Reference: https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation
function isFiltered(sp: Record<string, string | string[] | undefined>): boolean {
  const allowedKeys = new Set(["q"]);
  for (const k of Object.keys(sp)) {
    if (!allowedKeys.has(k)) return true;
  }
  return false;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = isFiltered(sp);
  const baseTitle = "Shop";
  const description =
    "Browse the full catalog of flowers, bouquets and gifting sets. Filter by occasion, price or category to find the perfect arrangement.";
  return {
    title: baseTitle,
    description,
    alternates: { canonical: "/search" },
    openGraph: {
      title: baseTitle,
      description,
      type: "website",
      url: "/search",
    },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

async function loadInitial(q?: string) {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions"
    );
    const query: Record<string, any> = {
      limit: 24,
      fields: "id,title,handle,thumbnail,description,variants.calculated_price",
    };
    if (q) query.q = q;
    if (regions?.[0]?.id) query.region_id = regions[0].id;
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      { query }
    );
    return products ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const products = await loadInitial(sp?.q);
  return (
    <>
      <div className="sr-only" aria-hidden="false">
        <h1>Shop</h1>
        <p>Browse our full catalog.</p>
        <ul>
          {products.slice(0, 24).map((p) => (
            <li key={p.id}>
              <a href={`/products/${p.handle}`}>{p.title}</a>
            </li>
          ))}
        </ul>
      </div>
      <SearchClient />
    </>
  );
}
