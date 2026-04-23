import type { Metadata } from "next";
import HomeClient from "./home-client";
import { sdk } from "@lib/medusa";

export const metadata: Metadata = {
  title: "What Shop — Flower Delivery & Gifting",
  description:
    "Fresh hand bouquets, flower stands and curated gifts with same-day delivery. Browse seasonal picks, designer arrangements and celebration sets.",
  openGraph: {
    title: "What Shop",
    description:
      "Fresh hand bouquets, flower stands and curated gifts with same-day delivery.",
    type: "website",
  },
  alternates: { canonical: "/" },
};

// Fetch a minimal server-side product summary + build JSON-LD structured
// data. Crawlers (Google / Bing / social) get meaningful metadata + an
// ItemList schema without waiting for client React to hydrate. Pure HTML
// injection — no React Query interaction, so the existing client tree is
// untouched.
async function fetchSeoData() {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions"
    );
    const regionId = regions?.[0]?.id;
    const query: Record<string, any> = {
      limit: 12,
      fields: "id,title,handle,thumbnail,description,variants.calculated_price",
    };
    if (regionId) query.region_id = regionId;
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      { query }
    );
    return products ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await fetchSeoData();
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://194.233.77.181:3003";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "What Shop",
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    makesOffer: products.slice(0, 8).map((p) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: p.title,
        description: p.description,
        image: p.thumbnail ?? undefined,
        url: `${base}/products/${p.handle}`,
      },
      price: p.variants?.[0]?.calculated_price?.calculated_amount ?? undefined,
      priceCurrency:
        p.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ??
        undefined,
    })),
  };
  return (
    <>
      {/* Crawler-visible content + schema. Hidden visually but present in
          the HTML that search engines index; the interactive ChawkBazar
          client tree below takes over once JS loads. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sr-only" aria-hidden="false">
        <h1>What Shop — Flower Delivery & Gifting</h1>
        <p>
          Fresh hand bouquets, flower stands and curated gifts with same-day
          delivery. Browse seasonal picks, designer arrangements and
          celebration sets.
        </p>
        <ul>
          {products.slice(0, 12).map((p) => (
            <li key={p.id}>
              <a href={`/products/${p.handle}`}>{p.title}</a>
              {p.description ? (
                <span> — {String(p.description).slice(0, 120)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <HomeClient />
    </>
  );
}
