import type React from "react";
import { loadSiteConfig, getConfigValue } from "@lib/site-config";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
  "https://what.com.my";

// Sitewide WebSite + Organization JSON-LD. Rendered at RSC level (outside
// the CSR-bail Shell), so crawlers that don't execute JS still see brand
// copy + structured data in raw HTML. Per-page JSON-LD (Product,
// BlogPosting, BreadcrumbList, FAQPage) is emitted from each route's own
// server component.
//
// All fields source from admin-editable site-config — no source-edit
// required to switch business positioning.
export default async function SEOHead(): Promise<React.ReactElement> {
  const cfg = await loadSiteConfig();
  const name = getConfigValue(cfg, "site_name", "Storefront");
  const description = getConfigValue(cfg, "site_tagline");
  const ogImageUrl = getConfigValue(cfg, "og_image_url");
  const localeOg = getConfigValue(cfg, "business_locale", "en_US");
  const inLanguage = localeOg.replace(/_/g, "-"); // og:locale "en_US" → BCP-47 "en-US"

  const sameAs = [
    getConfigValue(cfg, "social_facebook"),
    getConfigValue(cfg, "social_instagram"),
    getConfigValue(cfg, "social_tiktok"),
    getConfigValue(cfg, "social_whatsapp"),
  ].filter(Boolean);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: BASE_URL,
    description: description || undefined,
    inLanguage,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Drop undefined to keep the output tidy.
  if (!websiteJsonLd.description) delete (websiteJsonLd as any).description;

  const organizationJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: BASE_URL,
    logo: ogImageUrl || `${BASE_URL}/opengraph-image`,
  };
  if (sameAs.length) organizationJsonLd.sameAs = sameAs;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="sr-only" aria-hidden="false">
        {description ? <p>{description}</p> : null}
        <nav aria-label="Site">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
            <li>
              <a href="/about-us">About us</a>
            </li>
            <li>
              <a href="/contact-us">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
