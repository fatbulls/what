import type { Metadata } from "next";
import FAQClient from "./faq-client";
import { faq } from "@settings/faq.settings";
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

export default function FAQPage() {
  const jsonLd = buildFaqJsonLd(faq);
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <FAQClient />
    </>
  );
}
