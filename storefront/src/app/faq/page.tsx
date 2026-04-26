import type { Metadata } from "next";
import FAQClient from "./faq-client";
import { loadFaqs } from "@lib/site-faq";
import { buildFaqJsonLd } from "@lib/faq-jsonld";

const description =
  "Find answers to common questions about What Shop orders, delivery, and customization.";

export const metadata: Metadata = {
  title: "FAQ",
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ",
    description,
    type: "website",
    url: "/faq",
  },
};

export const revalidate = 60;

export default async function FAQPage() {
  const items = await loadFaqs("main");
  const jsonLd = buildFaqJsonLd(items);
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <FAQClient items={items} />
    </>
  );
}
