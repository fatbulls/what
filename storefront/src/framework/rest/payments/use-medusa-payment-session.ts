"use client";

// Native Medusa payment session flow. Replaces the Laravel-era stub at
// `stripe-intent.mutation.ts`:
//   - discover providers available to the cart's region
//   - initiate a session for the chosen provider
//   - surface the `client_secret` for Stripe Elements, or just a ready flag
//     for manual providers (DBT, COD) which settle via cart.complete()
//
// When no `pp_stripe_stripe` provider exists in the region, callers should
// hide the Stripe radio — the payment flow will otherwise attempt to mount
// a broken Payment Element.

import { sdk } from "@lib/medusa";

export type PaymentProvider = { id: string; is_enabled: boolean };

export async function listPaymentProviders(
  regionId: string,
): Promise<PaymentProvider[]> {
  try {
    const { payment_providers } = await sdk.client.fetch<{
      payment_providers: PaymentProvider[];
    }>("/store/payment-providers", { query: { region_id: regionId } });
    return payment_providers ?? [];
  } catch {
    return [];
  }
}

export async function initiatePaymentSession(
  cart: any,
  providerId: string,
  data?: Record<string, unknown>,
): Promise<{
  client_secret?: string;
  session_id?: string;
  provider_id: string;
} | null> {
  try {
    const res = await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: providerId,
      ...(data ? { data } : {}),
    });
    const session = (res as any)?.cart?.payment_collection?.payment_sessions?.find(
      (s: any) => s.provider_id === providerId && s.status !== "canceled",
    );
    return {
      client_secret: session?.data?.client_secret as string | undefined,
      session_id: session?.id as string | undefined,
      provider_id: providerId,
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[initiatePaymentSession]", (err as Error).message);
    }
    return null;
  }
}
