import type { Order, Product } from "@framework/types";
import type { Item as CartItem } from "@store/quick-cart/cart.utils";

declare global {
  interface Window {
    dataLayer: Array<Record<string, any>>;
  }
}

const hasGtm = Boolean(process.env.NEXT_PUBLIC_GTM_ID);
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "MYR";

const canTrack = () => hasGtm && typeof window !== "undefined";

type AnalyticsItem = {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

const ensureDataLayer = () => {
  if (!canTrack()) {
    return false;
  }
  window.dataLayer = window.dataLayer || [];
  return true;
};

const pushEcommerceEvent = (
  event: string,
  ecommerce: Record<string, unknown>,
  additionalFields: Record<string, unknown> = {}
) => {
  if (!ensureDataLayer()) {
    return;
  }
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event,
    ...additionalFields,
    ecommerce,
  });
};

export const pushDataLayerEvent = (
  event: string,
  payload?: Record<string, unknown>
) => {
  if (!ensureDataLayer()) {
    return;
  }
  window.dataLayer.push({ event, ...payload });
};

export const trackPageView = (pagePath: string) => {
  if (!ensureDataLayer()) {
    return;
  }
  window.dataLayer.push({
    event: "page_view",
    page_path: pagePath,
    page_location: window.location.href,
  });
};

type TrackAddToCartArgs = {
  product: Product;
  quantity: number;
  variation?: any;
};

const buildItemCategories = (product?: Product) => {
  const categories = product?.categories?.map((category) => category?.name).filter(Boolean) ?? [];
  const [item_category, item_category2, item_category3, item_category4, item_category5] = categories;
  return {
    item_category,
    item_category2,
    item_category3,
    item_category4,
    item_category5,
  };
};

const buildProductItem = (
  product: Product | null | undefined,
  overrides: Partial<AnalyticsItem> = {},
  index?: number
): AnalyticsItem | null => {
  if (!product) {
    return null;
  }

  const categories = buildItemCategories(product);
  const baseId = product?.id ?? product?.slug ?? product?.sku;
  if (typeof baseId === "undefined" || baseId === null) {
    return null;
  }

  const item: AnalyticsItem = {
    item_id: String(baseId),
    item_name: product?.name ?? String(baseId),
    item_brand: product?.shop?.name,
    item_variant: product?.unit ?? product?.sku ?? product?.product_type,
    price:
      typeof product?.sale_price === "number"
        ? product.sale_price
        : typeof product?.price === "number"
        ? product.price
        : undefined,
    ...categories,
    ...overrides,
  };

  if (typeof index === "number") {
    item.index = index + 1;
  }

  return item;
};

const buildCartItem = (
  item: CartItem | null | undefined,
  overrides: Partial<AnalyticsItem> = {}
): AnalyticsItem | null => {
  if (!item) {
    return null;
  }
  const baseId = item.id ?? item.productId ?? item.slug;
  if (typeof baseId === "undefined" || baseId === null) {
    return null;
  }
  const analyticsItem: AnalyticsItem = {
    item_id: String(baseId),
    item_name: item.name ?? String(baseId),
    price: typeof item.price === "number" ? item.price : Number(item.price ?? 0),
    quantity: typeof item.quantity === "number" ? item.quantity : Number(item.quantity ?? 0),
    item_variant: item.variationId ? String(item.variationId) : item.unit,
    item_list_name: overrides.item_list_name,
    item_list_id: overrides.item_list_id,
    item_brand: overrides.item_brand ?? item.shop?.name,
    ...overrides,
  };
  return analyticsItem;
};

const filterValidItems = (items: Array<AnalyticsItem | null | undefined>) =>
  items.filter((entry): entry is AnalyticsItem => Boolean(entry));

const calculateValueFromItems = (items: AnalyticsItem[]) =>
  items.reduce((sum, current) => sum + (current.price ?? 0) * (current.quantity ?? 1), 0);

export const trackAddToCart = ({
  product,
  quantity,
  variation,
}: TrackAddToCartArgs) => {
  if (!canTrack()) {
    return;
  }

  const unitPrice = (() => {
    if (variation) {
      const candidate = variation?.sale_price ?? variation?.price;
      return typeof candidate === "number" ? candidate : Number(candidate ?? 0);
    }
    const primary = product?.sale_price ?? product?.price;
    return typeof primary === "number" ? primary : Number(primary ?? 0);
  })();

  const totalValue = unitPrice * quantity;
  const baseItemId = variation ? `${product?.id}.${variation?.id}` : product?.id;
  const itemName = variation?.title
    ? `${product?.name ?? ""} - ${variation.title}`
    : product?.name ?? "";

  const item = {
    item_id: String(baseItemId ?? ""),
    item_name: itemName,
    quantity,
    price: Number.isFinite(unitPrice) ? unitPrice : 0,
    item_brand: product?.shop?.name,
    item_variant: variation?.title ?? product?.unit,
    item_list_name: product?.type?.name,
    ...buildItemCategories(product),
  };

  pushEcommerceEvent("add_to_cart", {
    currency: DEFAULT_CURRENCY,
    value: Number.isFinite(totalValue) ? totalValue : 0,
    items: [item],
  });
};

export const initializeGtmLayer = () => {
  if (!ensureDataLayer()) {
    return;
  }
};

export const hasAnalytics = () => hasGtm;

type TrackViewItemListArgs = {
  products?: Array<Product | null | undefined>;
  listName?: string;
  listId?: string;
};

export const trackViewItemList = ({ products, listName, listId }: TrackViewItemListArgs) => {
  if (!canTrack()) {
    return;
  }
  const items = filterValidItems(
    (products ?? []).map((product, index) =>
      buildProductItem(product ?? undefined, { item_list_name: listName, item_list_id: listId }, index)
    )
  );
  if (!items.length) {
    return;
  }
  pushEcommerceEvent("view_item_list", { items });
};

type TrackSelectItemArgs = {
  product?: Product | null;
  listName?: string;
  listId?: string;
  position?: number;
  variation?: any;
};

export const trackSelectItem = ({ product, listName, listId, position, variation }: TrackSelectItemArgs) => {
  if (!canTrack() || !product) {
    return;
  }
  const overrides: Partial<AnalyticsItem> = {
    item_list_name: listName,
    item_list_id: listId,
    item_variant: variation?.title ?? product.unit ?? product.product_type,
  };
  const item = buildProductItem(product, overrides, typeof position === "number" ? position : undefined);
  if (!item) {
    return;
  }
  pushEcommerceEvent("select_item", { items: [item] });
};

type TrackViewItemArgs = {
  product?: Product | null;
  variation?: any;
};

export const trackViewItem = ({ product, variation }: TrackViewItemArgs) => {
  if (!canTrack() || !product) {
    return;
  }
  const item = buildProductItem(product, {
    item_variant: variation?.title ?? product.unit ?? product.product_type,
    quantity: 1,
  });
  if (!item) {
    return;
  }
  pushEcommerceEvent("view_item", {
    currency: DEFAULT_CURRENCY,
    value: item.price ?? 0,
    items: [item],
  });
};

type TrackCartEventArgs = {
  items: CartItem[];
  coupon?: string | null;
  currency?: string;
  value?: number;
};

const buildCartItems = (cartItems: CartItem[]) => filterValidItems(cartItems.map((cartItem) => buildCartItem(cartItem)));

const resolveCartValue = (items: AnalyticsItem[], fallback?: number) => {
  if (typeof fallback === "number" && fallback > 0) {
    return fallback;
  }
  return calculateValueFromItems(items);
};

export const trackBeginCheckout = ({ items: cartItems, coupon, currency, value }: TrackCartEventArgs) => {
  if (!canTrack()) {
    return;
  }
  const items = buildCartItems(cartItems ?? []);
  if (!items.length) {
    return;
  }
  pushEcommerceEvent("begin_checkout", {
    currency: currency ?? DEFAULT_CURRENCY,
    value: resolveCartValue(items, value),
    coupon: coupon ?? undefined,
    items,
  });
};

export const trackAddShippingInfo = ({
  items: cartItems,
  coupon,
  currency,
  value,
  shippingTier,
}: TrackCartEventArgs & { shippingTier?: string }) => {
  if (!canTrack()) {
    return;
  }
  const items = buildCartItems(cartItems ?? []);
  if (!items.length) {
    return;
  }
  pushEcommerceEvent("add_shipping_info", {
    currency: currency ?? DEFAULT_CURRENCY,
    value: resolveCartValue(items, value),
    coupon: coupon ?? undefined,
    shipping_tier: shippingTier,
    items,
  });
};

export const trackAddPaymentInfo = ({
  items: cartItems,
  coupon,
  currency,
  value,
  paymentType,
}: TrackCartEventArgs & { paymentType?: string }) => {
  if (!canTrack()) {
    return;
  }
  const items = buildCartItems(cartItems ?? []);
  if (!items.length) {
    return;
  }
  pushEcommerceEvent("add_payment_info", {
    currency: currency ?? DEFAULT_CURRENCY,
    value: resolveCartValue(items, value),
    coupon: coupon ?? undefined,
    payment_type: paymentType,
    items,
  });
};

export const trackRemoveFromCart = ({
  item,
  quantity,
}: {
  item: CartItem;
  quantity: number;
}) => {
  if (!canTrack()) {
    return;
  }
  const analyticsItem = buildCartItem(item, { quantity });
  if (!analyticsItem) {
    return;
  }
  pushEcommerceEvent("remove_from_cart", {
    currency: DEFAULT_CURRENCY,
    value: (analyticsItem.price ?? 0) * (analyticsItem.quantity ?? 1),
    items: [analyticsItem],
  });
};

const buildOrderItems = (products: Order["products"] | undefined) => {
  if (!Array.isArray(products)) {
    return [] as AnalyticsItem[];
  }
  return filterValidItems(
    products.map((product: any, index) => {
      const variationId = product?.pivot?.variation_option_id;
      const quantity = product?.pivot?.order_quantity ?? product?.pivot?.quantity ?? product?.quantity ?? 1;
      const price = product?.pivot?.unit_price ?? product?.pivot?.subtotal ?? product?.price;
      return buildProductItem(
        product,
        {
          item_variant: variationId ? String(variationId) : product?.unit ?? product?.sku,
          price: typeof price === "number" ? price : Number(price ?? 0),
          quantity: typeof quantity === "number" ? quantity : Number(quantity ?? 0),
        },
        index
      );
    })
  );
};

export const trackPurchase = (order?: Order | null) => {
  if (!canTrack() || !order) {
    return;
  }
  const items = buildOrderItems(order.products);
  if (!items.length) {
    return;
  }
  const value =
    typeof order.paid_total === "number"
      ? order.paid_total
      : typeof order.total === "number"
      ? order.total
      : calculateValueFromItems(items);
  pushEcommerceEvent("purchase", {
    currency: DEFAULT_CURRENCY,
    value,
    transaction_id: order.tracking_number ?? String(order.id ?? Date.now()),
    tax: order.sales_tax ?? undefined,
    shipping: order.delivery_fee ?? undefined,
    coupon: order.coupon?.code ?? order?.coupon ?? undefined,
    items,
  });
};

export const trackSignUp = ({ method }: { method?: string } = {}) => {
  if (!ensureDataLayer()) {
    return;
  }
  window.dataLayer.push({
    event: "sign_up",
    method,
  });
};

export const trackLogin = ({ method }: { method?: string } = {}) => {
  if (!ensureDataLayer()) {
    return;
  }
  window.dataLayer.push({
    event: "login",
    method,
  });
};

export const trackSearch = ({
  searchTerm,
  resultsCount,
}: {
  searchTerm: string;
  resultsCount?: number;
}) => {
  if (!ensureDataLayer() || !searchTerm) {
    return;
  }
  window.dataLayer.push({
    event: "search",
    search_term: searchTerm,
    results_count: typeof resultsCount === "number" ? resultsCount : undefined,
  });
};
