import { CoreApi } from '@framework/utils/core-api';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { sdk } from '@lib/medusa';
import { adaptOrder } from '@framework/utils/adapters';
import { getActiveStripeCartId } from '@framework/payments/stripe-intent.mutation';

type OrderedProduct = {
  product_id: any;
  variation_option_id?: any;
  order_quantity: number;
  unit_price: number;
  subtotal: number;
};

type ChawkAddress = {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  street_address?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
};

function splitName(name?: string, fallback?: string): {
  first_name: string;
  last_name: string;
} {
  const source = (name || fallback || '').trim();
  if (!source) return { first_name: '', last_name: '' };
  const parts = source.split(/\s+/);
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' ') || '',
  };
}

// Map common country names to ISO-3166-1 alpha-2 codes. Everything else
// falls through to a lowercased 2-char slice (bugs on e.g. "Malaysia" → "ma"
// which is Morocco — that's why this map exists).
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  malaysia: 'my',
  singapore: 'sg',
  thailand: 'th',
  indonesia: 'id',
  philippines: 'ph',
  vietnam: 'vn',
  brunei: 'bn',
  'united states': 'us',
  'united kingdom': 'gb',
  uk: 'gb',
  usa: 'us',
  hongkong: 'hk',
  'hong kong': 'hk',
  taiwan: 'tw',
  china: 'cn',
  japan: 'jp',
  korea: 'kr',
  'south korea': 'kr',
  australia: 'au',
  'new zealand': 'nz',
  india: 'in',
  canada: 'ca',
};

function toCountryCode(raw?: string): string {
  if (!raw) return 'us';
  const v = raw.trim().toLowerCase();
  if (v.length === 2) return v;
  return COUNTRY_NAME_TO_ISO2[v] ?? v.slice(0, 2);
}

function mapAddress(addr: ChawkAddress | undefined, email?: string) {
  if (!addr) return undefined;
  const { first_name, last_name } = splitName(addr.name, email);
  return {
    first_name: addr.first_name || first_name,
    last_name: addr.last_name || last_name,
    address_1: addr.street_address || '',
    address_2: '',
    city: addr.city || '',
    province: addr.state || '',
    postal_code: addr.zip || '',
    country_code: toCountryCode(addr.country),
    phone: addr.phone || '',
  };
}

async function resolveRegionIdFor(countryCode: string): Promise<string | undefined> {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      '/store/regions'
    );
    const region = regions?.find((r) =>
      r.countries?.some((c: any) => c.iso_2 === countryCode)
    );
    return region?.id ?? regions?.[0]?.id;
  } catch {
    return undefined;
  }
}

class Order extends CoreApi {
  constructor(_base_path: string) {
    super(_base_path);
  }

  /**
   * Resolve an order for the confirmation page. Legacy ChawkBazar callers
   * pass `tracking-number/<display_id>`; modern callers pass the Medusa
   * order id directly. Both paths return an adapted order shape that
   * `OrderView` can render.
   */
  async findOne(id: any) {
    try {
      const raw = String(id ?? '');
      const m = raw.match(/^tracking-number\/(.+)$/);
      if (m) {
        const displayId = Number(m[1]);
        // First try listing by display_id (numeric Medusa-assigned number).
        if (Number.isFinite(displayId)) {
          const listed = await sdk.client.fetch<{ orders: any[] }>(
            '/store/orders',
            { query: { display_id: displayId, limit: 1, fields: '*items,*shipping_address,*billing_address,*payment_collections.payment_sessions' } }
          );
          const found = listed.orders?.[0];
          if (found) return { data: adaptOrder(found), status: 200, statusText: 'OK' };
        }
        // Fallback — treat the post-slash chunk as the raw order id.
        const fallback = await sdk.client.fetch<{ order: any }>(
          `/store/orders/${m[1]}`,
          { query: { fields: '*items,*shipping_address,*billing_address,*payment_collections.payment_sessions' } }
        );
        return { data: adaptOrder(fallback.order), status: 200, statusText: 'OK' };
      }
      const res = await sdk.client.fetch<{ order: any }>(
        `/store/orders/${raw}`,
        { query: { fields: '*items,*shipping_address,*billing_address,*payment_collections.payment_sessions' } }
      );
      return { data: adaptOrder(res.order), status: 200, statusText: 'OK' };
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[order.findOne]', (err as Error).message);
      }
      return { data: null, status: 404, statusText: 'Not Found' };
    }
  }

  /**
   * Place a ChawkBazar-style order via the Medusa cart/complete flow.
   * Input shape matches `buildOrderInput` in
   * `src/components/checkout/utils/order-input.ts`. Returns an object with
   * `id` + `tracking_number` so `place-order-action.tsx` can redirect to
   * `/my-account/orders/<tracking_number>`.
   */
  async create(input: any) {
    // Stripe fast-path — a cart with an initiated payment session already
    // exists (built by `useCreateStripePaymentIntentMutation`). Skip
    // re-building and just complete that cart on return from Stripe.
    const activeStripeCartId =
      input?.cart_id ?? getActiveStripeCartId();
    if (input?.payment_gateway === 'STRIPE' && activeStripeCartId) {
      const result: any = await sdk.store.cart.complete(activeStripeCartId);
      if (result?.type !== 'order') {
        throw new Error(result?.message || 'Order could not be completed');
      }
      const order = result.order;
      return {
        id: order.id,
        tracking_number: order.display_id ? String(order.display_id) : order.id,
        total: order.total,
        currency: order.currency_code,
        ...order,
      };
    }

    const products: OrderedProduct[] = input?.products ?? [];
    if (!products.length) {
      throw new Error('Cart is empty');
    }

    const shipping = mapAddress(
      input?.shipping_address,
      input?.customer_contact
    );
    const billing = mapAddress(input?.billing_address) ?? shipping;
    const countryCode = shipping?.country_code ?? 'us';

    const regionId = await resolveRegionIdFor(countryCode);
    if (!regionId) throw new Error('No Medusa region configured');

    // 1. Create cart
    const { cart } = await sdk.store.cart.create({ region_id: regionId });
    const cartId = cart.id;

    // 2. Add line items (variant_id comes from ChawkBazar's
    //    variation_option_id when present, else resolved via product lookup)
    for (const p of products) {
      let variantId = p.variation_option_id ?? null;
      if (!variantId) {
        // Fall back: fetch the product by id and use its first variant
        try {
          const { products: found } = await sdk.client.fetch<{
            products: any[];
          }>('/store/products', {
            query: { id: p.product_id, limit: 1, fields: 'variants.id' },
          });
          variantId = found?.[0]?.variants?.[0]?.id;
        } catch {
          /* ignore */
        }
      }
      if (!variantId) continue;
      await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity: p.order_quantity,
      });
    }

    // 3. Email + addresses
    const email =
      input?.customer_contact && input.customer_contact.includes('@')
        ? input.customer_contact
        : `guest-${Date.now()}@what-shop.local`;
    try {
      await sdk.store.cart.update(cartId, {
        email,
        shipping_address: shipping,
        billing_address: billing,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        'Failed to save addresses to cart';
      throw new Error(
        `Checkout: ${msg} (country_code=${shipping?.country_code}, region=${regionId})`,
      );
    }

    // 4. Shipping method (pick the first available)
    try {
      const { shipping_options } = await sdk.client.fetch<{
        shipping_options: any[];
      }>('/store/shipping-options', { query: { cart_id: cartId } });
      if (shipping_options?.[0]?.id) {
        await sdk.store.cart.addShippingMethod(cartId, {
          option_id: shipping_options[0].id,
        });
      }
    } catch {
      /* ignore */
    }

    // 5. Payment session (pick the first payment provider available in region)
    try {
      const { payment_providers } = await sdk.client.fetch<{
        payment_providers: { id: string }[];
      }>('/store/payment-providers', { query: { region_id: regionId } });
      const provider = payment_providers?.[0]?.id;
      if (provider) {
        const fresh = await sdk.client.fetch<any>(`/store/carts/${cartId}`);
        await sdk.store.payment.initiatePaymentSession(fresh.cart, {
          provider_id: provider,
        });
      }
    } catch {
      /* ignore */
    }

    // 6. Complete cart → order
    const result: any = await sdk.store.cart.complete(cartId);
    if (result?.type !== 'order') {
      throw new Error(result?.message || 'Order could not be completed');
    }

    const order = result.order;
    return {
      id: order.id,
      tracking_number: order.display_id
        ? String(order.display_id)
        : order.id,
      total: order.total,
      currency: order.currency_code,
      ...order,
    };
  }
}
export const OrderService = new Order(API_ENDPOINTS.ORDER);
