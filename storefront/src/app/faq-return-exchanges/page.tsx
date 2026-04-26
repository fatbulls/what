import type { Metadata } from "next";
import FAQReturnsClient from "./faq-returns-client";
import { loadFaqs } from "@lib/site-faq";
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

export const revalidate = 60;

export default async function FAQReturnsPage() {
  const items = await loadFaqs("returns");
  const jsonLd = buildFaqJsonLd(items);
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <FAQReturnsClient items={items} />
    </>
  );
}
