import type { Metadata } from "next";
import FAQShippingClient from "./faq-shipping-client";
import { loadFaqs } from "@lib/site-faq";
import { buildFaqJsonLd } from "@lib/faq-jsonld";

const description =
  "Find answers about delivery coverage, same-day cutoffs, and handling for What Shop orders.";

export const metadata: Metadata = {
  title: "Shipping & Delivery FAQ",
  description,
  alternates: { canonical: "/faq-shipping-delivery" },
  openGraph: {
    title: "Shipping & Delivery FAQ",
    description,
    type: "website",
    url: "/faq-shipping-delivery",
  },
};

export const revalidate = 60;

export default async function FAQShippingPage() {
  const items = await loadFaqs("shipping");
  const jsonLd = buildFaqJsonLd(items);
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <FAQShippingClient items={items} />
    </>
  );
}
