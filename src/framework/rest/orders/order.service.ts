import { CoreApi } from '@framework/utils/core-api';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { sdk } from '@lib/medusa';

export type VerifyCheckoutInputType = {
  amount: number;
  products: any[];
  billing_address: any;
  shipping_address: any;
};

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
    country_code: (addr.country || 'us').toLowerCase().slice(0, 2),
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

  verifyCheckout(input: VerifyCheckoutInputType) {
    // ChawkBazar uses this to confirm stock + recalculate totals before the
    // place-order click. With Medusa, stock checks happen during
    // `cart.complete()`. Return a stable success shape so the UI proceeds.
    return Promise.resolve({
      total_quantity: input.products?.length ?? 0,
      total_tax: 0,
      shipping_charge: 0,
      unavailable_products: [],
    });
  }

  /**
   * Place a ChawkBazar-style order via the Medusa cart/complete flow.
   * Input shape matches `buildOrderInput` in
   * `src/components/checkout/utils/order-input.ts`. Returns an object with
   * `id` + `tracking_number` so `place-order-action.tsx` can redirect to
   * `/my-account/orders/<tracking_number>`.
   */
  async create(input: any) {
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
    await sdk.store.cart.update(cartId, {
      email,
      shipping_address: shipping,
      billing_address: billing,
    });

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
