import type { Metadata } from "next";
import FAQReturnsClient from "./faq-returns-client";
import { faq_return_exchanges } from "@settings/faq.settings";
import { buildFaqJsonLd } from "@lib/faq-jsonld";

const description =
  "Get answers on What Shop returns, exchanges, timeframes, and conditions.";

export const metadata: Metadata = {
  title: "Return & Exchanges FAQ",
  description,
  alternates: { canonical: "/faq-return-exchanges" },
  openGraph: {
    title: "Return & Exchanges FAQ",
    description,
    type: "website",
    url: "/faq-return-exchanges",
  },
};

export default function FAQReturnsPage() {
  const jsonLd = buildFaqJsonLd(faq_return_exchanges);
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <FAQReturnsClient />
    </>
  );
}
