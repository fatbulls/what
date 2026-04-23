// Medusa-backed CoreApi: preserves the ChawkBazar CoreApi(path) signature,
// but each method dispatches to the appropriate Medusa SDK call and returns a
// response shape matching what ChawkBazar's query hooks expect.
//
// Axios is no longer used. The old `Request` interceptor/token logic is
// replaced by the Medusa SDK's built-in publishable-key and JWT handling
// (see `src/lib/medusa.ts`).

import { sdk } from "@lib/medusa";
import {
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
  if (typeof window === "undefined") return undefined;
  const match = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/);
  return match?.[1];
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
  if (!countryCode) return undefined;
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions"
    );
    const region = regions?.find((r) =>
      r.countries?.some((c: any) => c.iso_2 === countryCode)
    );
    return region?.id;
  } catch {
    return undefined;
  }
}

async function fetchProducts(params: ParamsType) {
  const countryCode = await currentRegionCountry();
  const limit = params.limit ?? 20;
  const page = params.page ?? 1;
  const offset = (page - 1) * limit;

  const query: Record<string, any> = {
    limit,
    offset,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,*images,*options.values,*categories,*tags",
  };

  if (params.text) query.q = params.text;
  // ChawkBazar filters like `tags: "featured"` / `tags: "on-sale"` / `type`
  // are string slugs that have no equivalent in Medusa's seed data. Skipping
  // them returns the full product list instead of an empty set; sorting /
  // ordering still applies so ProductsFeatured / NewArrivals differ.
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
    currency: "USD",
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
