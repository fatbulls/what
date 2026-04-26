import type { Metadata } from "next";
import FAQShippingClient from "./faq-shipping-client";
import { faq_shipping_delivery } from "@settings/faq.settings";
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

export default function FAQShippingPage() {
  const jsonLd = buildFaqJsonLd(faq_shipping_delivery);
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <FAQShippingClient />
    </>
  );
}
