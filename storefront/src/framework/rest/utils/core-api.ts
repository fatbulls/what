// Medusa-backed CoreApi: preserves the ChawkBazar CoreApi(path) signature,
// but each method dispatches to the appropriate Medusa SDK call and returns a
// response shape matching what ChawkBazar's query hooks expect.
//
// Axios is no longer used. The old `Request` interceptor/token logic is
// replaced by the Medusa SDK's built-in publishable-key and JWT handling
// (see `src/lib/medusa.ts`).

import { sdk } from "@lib/medusa";
import {
  adaptBlogPost,
  adaptCategory,
  adaptCustomer,
  adaptProduct,
  paginatorWrap,
} from "./adapters";

type NumberOrString = number | string;

export type ParamsType = {
  type?: string;
  text?: string;
  category?: string;
  tags?: string;
  variations?: string;
  status?: string;
  is_active?: string;
  shop_id?: string;
  limit?: number;
  sortedBy?: string;
  orderBy?: string;
  min_price?: string;
  max_price?: string;
  page?: number;
  parent?: string | null;
  [key: string]: any;
};

type AxiosLike<T> = { data: T; status: number; statusText: string };

function wrap<T>(data: T): AxiosLike<T> {
  return { data, status: 200, statusText: "OK" };
}

async function currentRegionCountry(): Promise<string | undefined> {
  // Single-region storefront — no URL prefix. Use the configured default
  // country code so Medusa picks a valid region; fall back to `us` if unset.
  return (
    process.env.NEXT_PUBLIC_DEFAULT_REGION ??
    process.env.DEFAULT_REGION ??
    "us"
  );
}

let _tagCache: Record<string, string> | null = null;
async function resolveTagId(value: string): Promise<string | null | undefined> {
  if (!value) return undefined;
  if (_tagCache && _tagCache[value] !== undefined) return _tagCache[value] || null;
  try {
    // Medusa /store endpoint doesn't expose tags; use /store/products?fields=tags
    // aggregation across first 200 products. Works fine at our scale.
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      { query: { limit: 200, fields: "tags.id,tags.value" } }
    );
    const map: Record<string, string> = {};
    for (const p of products ?? []) {
      for (const t of p?.tags ?? []) {
        if (t?.value && t?.id) map[t.value] = t.id;
      }
    }
    _tagCache = map;
    return map[value] ?? null;
  } catch {
    return null;
  }
}

let _categoryCache: Record<string, string> | null = null;
async function resolveCategoryId(slug: string): Promise<string | undefined> {
  if (!slug) return undefined;
  if (_categoryCache && _categoryCache[slug]) return _categoryCache[slug];
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: any[];
    }>("/store/product-categories", { query: { limit: 200, fields: "id,handle" } });
    const map: Record<string, string> = {};
    for (const c of product_categories ?? []) {
      if (c?.handle && c?.id) map[c.handle] = c.id;
    }
    _categoryCache = map;
    return map[slug];
  } catch {
    return undefined;
  }
}

async function resolveRegionId(countryCode?: string): Promise<string | undefined> {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions"
    );
    // Match the requested countryCode first; fall back to the first region
    // so products still render prices in single-region stores where the
    // default country env var doesn't happen to belong to any region.
    const byCountry = countryCode
      ? regions?.find((r) =>
          r.countries?.some((c: any) => c.iso_2 === countryCode)
        )
      : undefined;
    return byCountry?.id ?? regions?.[0]?.id;
  } catch {
    return undefined;
  }
}

async function fetchProducts(params: ParamsType) {
  const countryCode = await currentRegionCountry();
  const limit = params.limit ?? 20;
  const page = params.page ?? 1;
  const offset = (page - 1) * limit;

  // Full-text search goes through Meilisearch — fuzzy, instant, typo-tolerant.
  // We use it to resolve ids, then fetch the canonical Medusa product shape
  // so pricing, stock and region handling stay consistent with non-search
  // listings.
  if (params.text) {
    const regionIdForSearch = await resolveRegionId(countryCode);
    try {
      const searchRes = await sdk.client.fetch<{
        hits: Array<{ id: string }>;
        estimated_total?: number;
      }>("/store/search", {
        method: "GET",
        query: { q: params.text, limit, offset },
      });
      const ids = (searchRes.hits ?? []).map((h) => h.id);
      if (ids.length === 0) {
        return paginatorWrap([], searchRes.estimated_total ?? 0, limit, page);
      }
      const detailQuery: Record<string, any> = {
        id: ids,
        limit,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*images,*options.values,*categories,*tags",
      };
      if (regionIdForSearch) detailQuery.region_id = regionIdForSearch;
      const detail = await sdk.client.fetch<{
        products: any[];
      }>("/store/products", { method: "GET", query: detailQuery });
      // Preserve Meili relevance ordering.
      const byId = new Map<string, any>(
        (detail.products ?? []).map((p: any) => [p.id, p]),
      );
      const ordered = ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map(adaptProduct);
      return paginatorWrap(
        ordered,
        searchRes.estimated_total ?? ordered.length,
        limit,
        page,
      );
    } catch {
      // Fall through to the legacy SQL-LIKE path on search failure.
    }
  }

  const query: Record<string, any> = {
    limit,
    offset,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,*images,*options.values,*categories,*tags",
  };

  if (params.text) query.q = params.text;
  // ChawkBazar passes marketing tag slugs like `featured-products`,
  // `season-pick`, `designer-pick`. Translate to Medusa tag IDs — if the tag
  // doesn't exist in Medusa, return an empty paginator so sections that
  // expect zero results (e.g. ProductsFeatured when there's no `featured-
  // products` tag) correctly collapse to nothing.
  if (params.tags) {
    const tagId = await resolveTagId(String(params.tags));
    if (tagId === null) {
      return paginatorWrap([], 0, limit, page);
    }
    if (tagId) query.tag_id = tagId;
  }
  if (params.category) {
    // ChawkBazar passes the category SLUG (e.g. "shirts"). Medusa expects the
    // category ID (e.g. "pcat_01K..."). Resolve slug → id.
    const id = await resolveCategoryId(params.category);
    if (id) query.category_id = id;
  }
  if (params.orderBy) {
    const dir = params.sortedBy?.toUpperCase() === "ASC" ? "" : "-";
    query.order = `${dir}${params.orderBy}`;
  }

  const regionId = await resolveRegionId(countryCode);
  if (regionId) query.region_id = regionId;

  const res = await sdk.client.fetch<{
    products: any[];
    count: number;
  }>("/store/products", { method: "GET", query });

  return paginatorWrap(
    (res.products ?? []).map(adaptProduct),
    res.count ?? res.products?.length ?? 0,
    limit,
    page
  );
}

async function fetchProduct(handleOrId: NumberOrString) {
  const query: Record<string, any> = {
    handle: handleOrId,
    limit: 1,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,*images,*options.values,*categories,*tags",
  };
  const regionId = await resolveRegionId(await currentRegionCountry());
  if (regionId) query.region_id = regionId;
  const res = await sdk.client.fetch<{ products: any[] }>("/store/products", {
    method: "GET",
    query,
  });
  const product = res.products?.[0];
  return product ? adaptProduct(product) : null;
}

async function fetchCategories(params: ParamsType) {
  const res = await sdk.client.fetch<{
    product_categories: any[];
    count: number;
  }>("/store/product-categories", {
    method: "GET",
    query: {
      limit: params.limit ?? 100,
      fields: "*category_children,*parent_category,*products",
      include_descendants_tree: true,
      ...(params.parent === null || params.parent === "null"
        ? { parent_category_id: "null" }
        : {}),
    },
  });
  const items = (res.product_categories ?? []).map(adaptCategory);
  return paginatorWrap(items, res.count ?? items.length, params.limit ?? 100, 1);
}

async function fetchBlogPosts(params: ParamsType) {
  const limit = params.limit ?? 20;
  const page = params.page ?? 1;
  const offset = (page - 1) * limit;
  try {
    const res = await sdk.client.fetch<{
      posts: any[];
      count: number;
    }>("/store/blog-posts", {
      method: "GET",
      query: { limit, offset, q: params.text },
    });
    const posts = (res.posts ?? []).map(adaptBlogPost);
    return paginatorWrap(posts, res.count ?? posts.length, limit, page);
  } catch {
    return paginatorWrap([], 0, limit, page);
  }
}

async function fetchBlogPost(slug: NumberOrString) {
  try {
    const res = await sdk.client.fetch<{ post: any }>(
      `/store/blog-posts/${slug}`
    );
    return res.post ? adaptBlogPost(res.post) : null;
  } catch {
    return null;
  }
}

async function fetchMe() {
  try {
    const res = await sdk.client.fetch<{ customer: any }>(
      "/store/customers/me",
      { method: "GET", query: { fields: "*addresses" } }
    );
    return adaptCustomer(res.customer);
  } catch {
    return null;
  }
}

async function fetchOrders(params: ParamsType) {
  try {
    const res = await sdk.client.fetch<{ orders: any[]; count: number }>(
      "/store/orders",
      {
        method: "GET",
        query: {
          limit: params.limit ?? 10,
          offset: ((params.page ?? 1) - 1) * (params.limit ?? 10),
          order: "-created_at",
          fields: "*items,*shipping_address",
        },
      }
    );
    return paginatorWrap(
      res.orders ?? [],
      res.count ?? res.orders?.length ?? 0,
      params.limit ?? 10,
      params.page ?? 1
    );
  } catch {
    return paginatorWrap([], 0, params.limit ?? 10, 1);
  }
}

const STATIC_SETTINGS = {
  id: 1,
  options: {
    siteTitle: "What Shop",
    siteSubtitle: "Powered by Medusa",
    currency: "MYR",
    logo: {
      id: 1,
      original: "/image/logo/logo.svg",
      thumbnail: "/image/logo/logo.svg",
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: null,
      twitterHandle: "",
      twitterCardType: "",
      metaTags: "",
      canonicalUrl: "",
    },
    contactDetails: {
      contact: "",
      email: "",
      website: "",
      location: { formattedAddress: "" },
    },
    useOtp: false,
    useGoogleMap: false,
    useAi: false,
    currencyOptions: { formation: "en-US", fractions: 2 },
    google: { isEnable: false, tagManagerId: "" },
    facebook: { isEnable: false, appId: "", pageId: "" },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export class CoreApi {
  constructor(public _base_path: string) {}

  async find(params: ParamsType) {
    switch (this._base_path) {
      case "products":
      case "popular-products":
        return wrap(await fetchProducts(params));
      case "categories":
      case "parent-categories":
      case "featured-categories":
        return wrap(await fetchCategories(params));
      case "orders":
        return wrap(await fetchOrders(params));
      case "posts":
        return wrap(await fetchBlogPosts(params));
      case "users":
      case "me":
        return wrap(await fetchMe());
      case "settings":
        return wrap(STATIC_SETTINGS);
      default:
        // Unhandled endpoints → empty paginator so UI renders empty state.
        return wrap(paginatorWrap([], 0, params.limit ?? 20, 1));
    }
  }

  async findAll() {
    return this.find({});
  }

  async findOne(id: NumberOrString) {
    switch (this._base_path) {
      case "products":
        return wrap(await fetchProduct(id));
      case "posts":
        return wrap(await fetchBlogPost(id));
      case "me":
      case "users":
        return wrap(await fetchMe());
      case "settings":
        return wrap(STATIC_SETTINGS);
      default:
        return wrap(null);
    }
  }

  async fetchUrl(_url: string) {
    // Pagination cursors not supported in this port; callers should pass
    // explicit `page` params. Return empty for safety.
    return wrap(paginatorWrap([], 0, 20, 1));
  }

  async postUrl(_url: string, _data: any) {
    return wrap({});
  }

  async create(_data: any, _options?: any) {
    return {};
  }

  async update(_id: NumberOrString, _data: any) {
    return {};
  }

  async delete(_id: NumberOrString) {
    return wrap({});
  }
}
