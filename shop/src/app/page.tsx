import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import HomeClient from "./home-client";
import { sdk } from "@lib/medusa";
import {
  adaptProduct,
  adaptCategory,
  adaptBlogPost,
} from "@framework/utils/adapters";

// ISR — regenerate in background every 60s; first paint is cached HTML.
export const revalidate = 60;

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

// ---- server-side data fetchers ----
async function firstRegionId(): Promise<string | undefined> {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions"
    );
    return regions?.[0]?.id;
  } catch {
    return undefined;
  }
}

async function resolveTagId(value: string): Promise<string | undefined> {
  try {
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      { query: { limit: 200, fields: "tags.id,tags.value" } }
    );
    for (const p of products ?? []) {
      for (const t of p?.tags ?? []) {
        if (t?.value === value) return t.id;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function serverListProducts(params: {
  limit?: number;
  tags?: string;
  orderBy?: string;
  sortedBy?: string;
}) {
  const regionId = await firstRegionId();
  const query: Record<string, any> = {
    limit: params.limit ?? 20,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,*images,*options.values,*categories,*tags",
  };
  if (regionId) query.region_id = regionId;
  if (params.tags) {
    const tagId = await resolveTagId(params.tags);
    if (!tagId) return { data: [], paginatorInfo: {} };
    query.tag_id = tagId;
  }
  if (params.orderBy) {
    const dir = params.sortedBy?.toUpperCase() === "ASC" ? "" : "-";
    query.order = `${dir}${params.orderBy}`;
  }
  try {
    const { products, count } = await sdk.client.fetch<{
      products: any[];
      count: number;
    }>("/store/products", { query });
    return {
      data: (products ?? []).map(adaptProduct),
      paginatorInfo: { total: count ?? 0 },
    };
  } catch {
    return { data: [], paginatorInfo: {} };
  }
}

async function serverListCategories() {
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: any[];
    }>("/store/product-categories", {
      query: { limit: 100, fields: "*category_children,*parent_category,*products" },
    });
    return {
      data: (product_categories ?? []).map(adaptCategory),
      paginatorInfo: {},
    };
  } catch {
    return { data: [], paginatorInfo: {} };
  }
}

async function serverListBlogs() {
  try {
    const { posts, count } = await sdk.client.fetch<{
      posts: any[];
      count: number;
    }>("/store/blog-posts", { query: { limit: 6 } });
    return {
      data: (posts ?? []).map(adaptBlogPost),
      paginatorInfo: { total: count ?? 0 },
    };
  } catch {
    return { data: [], paginatorInfo: {} };
  }
}

async function prefetchHome() {
  const qc = new QueryClient();
  const [featured, season, designer, categories, blogs] = await Promise.all([
    serverListProducts({ limit: 5, tags: "featured-products" }),
    serverListProducts({ limit: 9, tags: "season-pick" }),
    serverListProducts({
      limit: 10,
      tags: "designer-pick",
      orderBy: "created_at",
      sortedBy: "DESC",
    }),
    serverListCategories(),
    serverListBlogs(),
  ]);

  // Match the exact query keys ChawkBazar hooks use so clients hydrate from
  // cache without a re-fetch.
  qc.setQueryData(
    ["products", { limit: 5, tags: "featured-products" }],
    { data: featured.data }
  );
  qc.setQueryData(
    ["products", { limit: 9, tags: "season-pick" }],
    { data: season.data }
  );
  qc.setQueryData(
    [
      "products",
      {
        limit: 10,
        tags: "designer-pick",
        orderBy: "created_at",
        sortedBy: "DESC",
      },
    ],
    { data: designer.data }
  );
  qc.setQueryData(
    ["categories", { limit: 30, parent: null }],
    { data: categories.data }
  );
  qc.setQueryData(["posts"], { blogs: blogs.data });

  return { dehydrated: dehydrate(qc), firstProducts: featured.data.concat(season.data).slice(0, 12) };
}

export default async function Home() {
  const { dehydrated, firstProducts } = await prefetchHome();
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
    makesOffer: firstProducts.slice(0, 8).map((p: any) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: p.name,
        description: p.description,
        image: p.image?.original,
        url: `${base}/products/${p.slug}`,
      },
      price: p.price,
      priceCurrency: "EUR",
    })),
  };
  return (
    <HydrationBoundary state={dehydrated}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sr-only" aria-hidden="false">
        <h1>What Shop — Flower Delivery & Gifting</h1>
        <p>
          Fresh hand bouquets, flower stands and curated gifts with same-day
          delivery.
        </p>
        <ul>
          {firstProducts.slice(0, 12).map((p: any) => (
            <li key={p.id}>
              <a href={`/products/${p.slug}`}>{p.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <HomeClient />
    </HydrationBoundary>
  );
}
