// Medusa StoreProduct -> ChawkBazar Product shape adapter.
// ChawkBazar's `Product` has fields the UI components read directly:
//   id, name, slug, image, gallery, price, sale_price, min_price, max_price,
//   product_type, description, variations, shop, categories, type, quantity.
//
// Medusa's `StoreProduct` uses title, handle, thumbnail, images[], variants[]
// (with `calculated_price`). We map field by field so ChawkBazar components
// render without any JSX change.

import { HttpTypes } from "@medusajs/types";

type AnyProduct = HttpTypes.StoreProduct & Record<string, any>;

function pickPriceAmount(variant: any): number | null {
  const cp = variant?.calculated_price;
  if (!cp) return null;
  if (typeof cp.calculated_amount === "number") return cp.calculated_amount;
  if (typeof cp.amount === "number") return cp.amount;
  return null;
}

function pickOriginalAmount(variant: any): number | null {
  const cp = variant?.calculated_price;
  if (!cp) return null;
  if (typeof cp.original_amount === "number") return cp.original_amount;
  return null;
}

export function adaptProduct(p: AnyProduct): any {
  const firstVariant = p.variants?.[0];
  const price = pickPriceAmount(firstVariant) ?? 0;
  const original = pickOriginalAmount(firstVariant) ?? price;
  const isOnSale = original !== null && original > price;

  const prices: number[] = (p.variants ?? [])
    .map((v: any) => pickPriceAmount(v))
    .filter((x: number | null): x is number => x !== null);
  const minPrice = prices.length ? Math.min(...prices) : price;
  const maxPrice = prices.length ? Math.max(...prices) : price;

  const image = p.thumbnail
    ? {
        id: p.id,
        original: p.thumbnail,
        thumbnail: p.thumbnail,
      }
    : undefined;

  const gallery = (p.images ?? []).map((img: any) => ({
    id: img.id,
    original: img.url,
    thumbnail: img.url,
  }));

  const categories = (p.categories ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.handle,
    icon: null,
  }));

  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    image,
    gallery,
    description: p.description ?? "",
    price: isOnSale ? original : price,
    sale_price: isOnSale ? price : undefined,
    min_price: minPrice,
    max_price: maxPrice,
    quantity: firstVariant?.inventory_quantity ?? 99,
    product_type: p.variants && p.variants.length > 1 ? "variable" : "simple",
    type: { slug: "simple", name: "Simple" },
    shop: null,
    categories,
    tags: p.tags ?? [],
    variations: (p.options ?? []).map((o: any) => ({
      id: o.id,
      attribute: { id: o.id, name: o.title, slug: o.title },
      value: o.values?.[0]?.value,
    })),
    variation_options: (p.variants ?? []).map((v: any) => ({
      id: v.id,
      title: v.title,
      price: pickPriceAmount(v) ?? 0,
      sale_price: pickOriginalAmount(v),
      quantity: v.inventory_quantity ?? 99,
      is_disable: false,
      options: v.options?.map((o: any) => ({
        name: o.option?.title,
        value: o.value,
      })),
    })),
    in_stock: (firstVariant?.inventory_quantity ?? 1) > 0 ? 1 : 0,
    is_taxable: false,
    status: "publish",
    created_at: p.created_at,
    updated_at: p.updated_at,
    // Keep the original Medusa product under a hidden key for debug /
    // for components that want to reach through.
    __medusa: p,
  };
}

export function adaptCategory(c: any): any {
  // ChawkBazar's `getCategoryTypeImage` expects `image` to be an ARRAY of
  // image objects (it does `image[0]` / `image[1]`). Medusa stores a single
  // image URL in metadata.image — wrap it as a 1-element array.
  const imageObj = c.metadata?.image
    ? { id: c.id, original: c.metadata.image, thumbnail: c.metadata.image }
    : null;
  return {
    id: c.id,
    name: c.name,
    slug: c.handle,
    icon: null,
    image: imageObj ? [imageObj] : [],
    details: c.description ?? "",
    products_count: c.products?.length ?? 0,
    parent: c.parent_category?.id ?? null,
    parent_id: c.parent_category?.id ?? null,
    children: (c.category_children ?? []).map(adaptCategory),
    type: { slug: "category", name: "Category" },
  };
}

export function paginatorWrap<T>(
  items: T[],
  total: number,
  perPage: number,
  currentPage: number = 1
): {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page_url: string | null;
  last_page_url: string | null;
  next_page_url: string | null;
  prev_page_url: string | null;
} {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  return {
    data: items,
    total,
    per_page: perPage,
    current_page: currentPage,
    last_page: lastPage,
    first_page_url: null,
    last_page_url: null,
    next_page_url: currentPage < lastPage ? `?page=${currentPage + 1}` : null,
    prev_page_url: currentPage > 1 ? `?page=${currentPage - 1}` : null,
  };
}

export function adaptCustomer(c: HttpTypes.StoreCustomer | null): any {
  if (!c) return null;
  return {
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email,
    first_name: c.first_name,
    last_name: c.last_name,
    email: c.email,
    phone: c.phone,
    profile: {
      id: c.id,
      name: [c.first_name, c.last_name].filter(Boolean).join(" "),
      contact: c.phone,
      bio: "",
      avatar: null,
    },
    address: (c.addresses ?? []).map((a: any) => ({
      id: a.id,
      title: "Home",
      type: "primary",
      address: {
        country: a.country_code?.toUpperCase(),
        city: a.city,
        state: a.province,
        zip: a.postal_code,
        street_address: [a.address_1, a.address_2].filter(Boolean).join(", "),
      },
    })),
    is_active: 1,
  };
}
