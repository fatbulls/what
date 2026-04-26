// Sitewide default OG image — dynamically rendered via Next 15's next/og
// (Satori). Per-page metadata (PDP, blog detail) overrides this with a
// product/post image. Brand text + colours come from admin-editable
// site-config so the same template works for any business positioning.
//
// File-based opengraph-image takes priority over `metadata.openGraph.images`
// in Next 15, so when an admin uploads a custom OG asset (`og_image_url`),
// this route fetches that image and streams it back. The dynamic Satori
// render is the fallback.
//
// Runtime is the Node.js default (not edge): we await loadSiteConfig
// which is server-only and uses Node's `cache()`. Cold render is ~1s,
// then served from Next's data cache.
import { ImageResponse } from "next/og";
import { loadSiteConfig, getConfigValue } from "@lib/site-config";

export const alt = "Storefront cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const cfg = await loadSiteConfig();
  const overrideUrl = getConfigValue(cfg, "og_image_url");

  // Admin-uploaded asset wins. Stream it through this route so the
  // og:image URL stays stable (https://example.com/opengraph-image)
  // regardless of where the merchant hosts the underlying file.
  if (overrideUrl) {
    try {
      const upstream = await fetch(overrideUrl, { cache: "no-store" });
      if (upstream.ok) {
        return new Response(await upstream.arrayBuffer(), {
          headers: {
            "content-type": upstream.headers.get("content-type") || "image/jpeg",
            "cache-control": "public, max-age=300, s-maxage=3600",
          },
        });
      }
    } catch {
      // fall through to the Satori render below
    }
  }

  const name = getConfigValue(cfg, "site_name", "Storefront");
  const subtitle =
    getConfigValue(cfg, "og_subtitle") ||
    getConfigValue(cfg, "site_tagline");
  const footer = getConfigValue(cfg, "og_footer_text");
  const brand = getConfigValue(cfg, "og_brand_color", "#000000");
  const bgFrom = getConfigValue(cfg, "og_bg_color_from", "#fafafa");
  const bgTo = getConfigValue(cfg, "og_bg_color_to", "#e5e5e5");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#1f2937",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          {name}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 36,
              opacity: 0.78,
              maxWidth: 1000,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        ) : null}
        {footer ? (
          <div
            style={{
              marginTop: 64,
              fontSize: 24,
              color: brand,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
