// Sitewide LocalBusiness JSON-LD. Server component — renders directly
// into <head> via root layout. Every field is sourced from
// admin-editable site-config so the same code can serve any business
// positioning (florist, clothing, restaurant, etc.) without touching
// source.
//
// Fallback chain for each field is documented inline. If the merchant
// hasn't filled in enough information, the field is omitted entirely
// rather than emitting placeholders — Google's Rich Results validator
// flags empty PostalAddress / empty areaServed as errors.

import { loadSiteConfig, getConfigValue } from "@lib/site-config";

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "https://what.com.my";

export default async function LocalBusinessJsonLd() {
  const cfg = await loadSiteConfig();

  const type = getConfigValue(cfg, "business_type", "LocalBusiness");
  const name = getConfigValue(cfg, "site_name", "Storefront");
  const description = getConfigValue(cfg, "site_tagline");
  const phone = getConfigValue(cfg, "contact_phone");
  const email = getConfigValue(cfg, "contact_email");
  const country = getConfigValue(cfg, "business_country");
  const priceRange = getConfigValue(cfg, "business_price_range", "$$");
  const areaServedRaw = getConfigValue(cfg, "business_area_served");
  const ogImageUrl = getConfigValue(cfg, "og_image_url");

  // Address: business_address_* override → pickup_* fallback →
  // contact_address as a last resort (single-line streetAddress only).
  const street =
    getConfigValue(cfg, "business_address_street") ||
    getConfigValue(cfg, "pickup_street") ||
    getConfigValue(cfg, "contact_address");
  const city =
    getConfigValue(cfg, "business_address_city") ||
    getConfigValue(cfg, "pickup_city");
  const region =
    getConfigValue(cfg, "business_address_region") ||
    getConfigValue(cfg, "pickup_state");
  const postal =
    getConfigValue(cfg, "business_address_postal_code") ||
    getConfigValue(cfg, "pickup_zip");

  const sameAs = [
    getConfigValue(cfg, "social_facebook"),
    getConfigValue(cfg, "social_instagram"),
    getConfigValue(cfg, "social_tiktok"),
  ].filter(Boolean);

  // Build PostalAddress only if at least street OR (city+region) is set —
  // an address with only addressCountry is useless and trips validators.
  const hasUsableAddress = !!street || (!!city && !!region);
  const address = hasUsableAddress
    ? {
        "@type": "PostalAddress" as const,
        streetAddress: street || undefined,
        addressLocality: city || undefined,
        addressRegion: region || undefined,
        postalCode: postal || undefined,
        addressCountry: country || undefined,
      }
    : undefined;

  // Parse areaServed: "Kuala Lumpur, Petaling Jaya" → two City entries.
  const areaServed = areaServedRaw
    ? areaServedRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((nm) => ({ "@type": "City" as const, name: nm }))
    : undefined;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    url: BASE,
    description: description || undefined,
    telephone: phone || undefined,
    email: email || undefined,
    address,
    areaServed: areaServed && areaServed.length ? areaServed : undefined,
    priceRange,
    image: ogImageUrl || `${BASE}/opengraph-image`,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  // Strip undefined keys so the rendered JSON-LD is clean.
  for (const k of Object.keys(schema)) {
    if (schema[k] === undefined) delete schema[k];
  }
  if (address) {
    for (const k of Object.keys(address)) {
      if ((address as any)[k] === undefined) delete (address as any)[k];
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
