import "server-only";
import { cache } from "react";

// Server-side FAQ fetcher. Cached per render pass via React `cache()`,
// and per ISR window via `next.revalidate`. The `faq:<slot>` tag is
// invalidated by the Medusa admin write hooks → admin saves propagate
// within ~100ms.

const BACKEND =
  process.env.MEDUSA_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://127.0.0.1:9000";
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export type FaqItem = {
  id: string;
  slot: string;
  position: number;
  question: string;
  answer: string;
};

async function _loadFaqs(slot: string): Promise<FaqItem[]> {
  try {
    const res = await fetch(`${BACKEND}/store/faqs?slot=${slot}`, {
      headers: PK ? { "x-publishable-api-key": PK } : {},
      next: { revalidate: 60, tags: [`faq:${slot}`] },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items?: FaqItem[] };
    return body.items ?? [];
  } catch {
    return [];
  }
}

export const loadFaqs = cache(_loadFaqs);
