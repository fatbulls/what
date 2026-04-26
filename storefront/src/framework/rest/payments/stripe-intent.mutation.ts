"use client";

// Native Medusa payment flow wrapper. Preserves the legacy callsite shape
// (`useCreateStripePaymentIntentMutation` → returns `{client_secret,
// payment_intent_id}`) so `stripe.tsx` doesn't need a rewrite, but routes
// through Medusa's `sdk.store.payment.initiatePaymentSession` instead of
// the old Laravel stub. Adds `cart_id` to the response so the place-order
// step can `cart.complete(cart_id)` directly.
//
// `fetchStripeOrderByIntent` is a no-op today — the confirmation page
// resolves orders via `OrderService.findOne(tracking-number/...)` instead.

import { useAtom } from "jotai";
import { useMutation } from "react-query";
import { sdk } from "@lib/medusa";
import { checkoutAtom } from "@store/checkout";
import { useCart } from "@store/quick-cart/cart.context";
import {
  initiatePaymentSession,
  listPaymentProviders,
} from "./use-medusa-payment-session";

type StripeIntentPayload = {
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
};

type StripeIntentResponse = {
  client_secret: string;
  payment_intent_id: string;
  status: string;
  cart_id?: string;
};

const COUNTRY_MAP: Record<string, string> = {
  malaysia: "my",
  singapore: "sg",
  "united states": "us",
  "united kingdom": "gb",
  japan: "jp",
  china: "cn",
};

function toCountryCode(raw?: string): string {
  if (!raw) return "my";
  const v = raw.trim().toLowerCase();
  if (v.length === 2) return v;
  return COUNTRY_MAP[v] ?? v.slice(0, 2);
}

async function resolveRegionId(country: string): Promise<string | undefined> {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions",
    );
    const r = regions?.find((r) =>
      r.countries?.some((c: any) => c.iso_2 === country),
    );
    return r?.id ?? regions?.[0]?.id;
  } catch {
    return undefined;
  }
}

async function buildCartForStripe(args: {
  items: any[];
  checkout: any;
}): Promise<{ cartId: string; clientSecret: string; paymentIntentId: string }> {
  const { items, checkout } = args;

  const shipping = checkout?.shipping_address?.address ?? {};
  const billing =
    (checkout?.billing_same_as_shipping ?? true)
      ? shipping
      : checkout?.billing_address?.address ?? shipping;

  const countryCode = toCountryCode(shipping?.country);
  const regionId = await resolveRegionId(countryCode);
  if (!regionId) throw new Error("No Medusa region available");

  // 1. Cart
  const { cart } = await sdk.store.cart.create({ region_id: regionId });
  const cartId = cart.id;

  // 2. Items
  for (const it of items ?? []) {
    const variantId = (it as any).variationId ?? (it as any).variant_id ?? null;
    const quantity = Number((it as any).quantity ?? 1);
    if (!variantId) continue;
    await sdk.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    });
  }

  // 3. Email + addresses
  const email =
    checkout?.email ||
    checkout?.customer_contact ||
    shipping?.phone_number ||
    `guest-${Date.now()}@what-shop.local`;
  const mapAddr = (a: any) => ({
    first_name: a?.first_name ?? "",
    last_name: a?.last_name ?? "",
    address_1: a?.street_address ?? "",
    city: a?.city ?? "",
    province: a?.state ?? "",
    postal_code: a?.zip ?? "",
    country_code: toCountryCode(a?.country),
    phone: a?.phone_number ?? a?.phone ?? "",
  });
  await sdk.store.cart.update(cartId, {
    email,
    shipping_address: mapAddr(shipping),
    billing_address: mapAddr(billing),
  });

  // 4. Shipping method
  try {
    const { shipping_options } = await sdk.client.fetch<{
      shipping_options: any[];
    }>("/store/shipping-options", { query: { cart_id: cartId } });
    if (shipping_options?.[0]?.id) {
      await sdk.store.cart.addShippingMethod(cartId, {
        option_id: shipping_options[0].id,
      });
    }
  } catch {
    /* ignore */
  }

  // 5. Confirm Stripe is enabled in this region
  const providers = await listPaymentProviders(regionId);
  const stripe = providers.find((p) => p.id === "pp_stripe_stripe");
  if (!stripe) {
    throw new Error(
      "Stripe is not enabled in this region. Please choose a different payment method.",
    );
  }

  // 6. Initiate Stripe payment session
  const fresh = await sdk.client.fetch<{ cart: any }>(`/store/carts/${cartId}`);
  const session = await initiatePaymentSession(fresh.cart, "pp_stripe_stripe");
  if (!session?.client_secret) {
    throw new Error("Stripe payment session could not be initialized.");
  }

  // Stripe `client_secret` format: pi_XXX_secret_YYY → extract the PI id.
  const piId = session.client_secret.split("_secret")[0];

  return {
    cartId,
    clientSecret: session.client_secret,
    paymentIntentId: piId,
  };
}

// Module-level store of the cart id created for the current Stripe attempt.
// Exported so the return-URL handler can complete the same cart rather
// than creating a new one on `cart.complete()`.
let _lastCartId: string | null = null;
export function getActiveStripeCartId(): string | null {
  return _lastCartId;
}

export const useCreateStripePaymentIntentMutation = () => {
  const { items } = useCart();
  const [checkout] = useAtom(checkoutAtom);

  return useMutation(async (_input: StripeIntentPayload): Promise<StripeIntentResponse> => {
    const { cartId, clientSecret, paymentIntentId } = await buildCartForStripe({
      items: items ?? [],
      checkout,
    });
    _lastCartId = cartId;
    return {
      client_secret: clientSecret,
      payment_intent_id: paymentIntentId,
      status: "requires_payment_method",
      cart_id: cartId,
    };
  });
};

// Legacy — no longer resolves an order by payment intent; return null so
// the caller falls through to its own order-fetch path.
export const fetchStripeOrderByIntent = async (_paymentIntentId: string) => {
  return null;
};
