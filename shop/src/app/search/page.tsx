import type { Metadata } from "next";
import SearchClient from "./page-client";
import { sdk } from "@lib/medusa";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop — What Shop",
  description:
    "Browse the full catalog of flowers, bouquets and gifting sets. Filter by occasion, price or category to find the perfect arrangement.",
  alternates: { canonical: "/search" },
};

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
