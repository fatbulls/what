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

// Home page inherits title + description + OG defaults from the root
// layout's generateMetadata (which reads site_name + site_tagline from
// admin site-config). Only set fields here that are genuinely
// home-specific — currently just the canonical "/" anchor (which root
// layout also already declares; restating is harmless).
export const metadata: Metadata = {
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

async function serverListBanners(): Promise<
  Array<{
    id: string;
    title: string;
    link: string | null;
    image_url: string;
    image_url_mobile: string | null;
  }>
> {
  try {
    const { banners } = await sdk.client.fetch<{ banners: any[] }>(
      "/store/banners",
      { query: { slot: "hero", limit: 6 } },
    );
    return (banners ?? []).map((b: any) => ({
      id: b.id,
      title: b.title,
      link: b.link ?? null,
      image_url: b.image_url,
      image_url_mobile: b.image_url_mobile ?? null,
    }));
  } catch {
    return [];
  }
}

async function prefetchHome() {
  const qc = new QueryClient();
  const [featured, season, designer, categories, blogs, liveBanners] =
    await Promise.all([
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
      serverListBanners(),
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

  return {
    dehydrated: dehydrate(qc),
    firstProducts: featured.data.concat(season.data).slice(0, 12),
    liveBanners,
  };
}

export default async function Home() {
  const { dehydrated, firstProducts, liveBanners } = await prefetchHome();
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://194.233.77.181:3003";
  // Read site-config + first region for brand name and currency. These
  // drive the home-page Store JSON-LD without baking florist or MYR
  // assumptions into source.
  const [{ loadSiteConfig, getConfigValue }, regions] = await Promise.all([
    import("@lib/site-config"),
    sdk.client
      .fetch<{ regions: any[] }>("/store/regions")
      .then((r) => r.regions ?? [])
      .catch(() => []),
  ]);
  const cfg = await loadSiteConfig();
  const name = getConfigValue(cfg, "site_name", "Storefront");
  const currency =
    (regions[0]?.currency_code as string | undefined)?.toUpperCase() ?? "USD";

  // Store + makesOffer is home-specific (it lists home-page featured
  // products). WebSite/Organization/LocalBusiness are emitted sitewide
  // from the root layout.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name,
    url: base,
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
      priceCurrency: currency,
    })),
  };
  return (
    <HydrationBoundary state={dehydrated}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sr-only" aria-hidden="false">
        <h1>{name}</h1>
        {getConfigValue(cfg, "site_tagline") ? (
          <p>{getConfigValue(cfg, "site_tagline")}</p>
        ) : null}
        <ul>
          {firstProducts.slice(0, 12).map((p: any) => (
            <li key={p.id}>
              <a href={`/products/${p.slug}`}>{p.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <HomeClient liveBanners={liveBanners} />
    </HydrationBoundary>
  );
}
