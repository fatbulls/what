import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Providers from "./providers";
import Shell from "./shell";
import SEOHead from "./seo-head";
import LocalBusinessJsonLd from "@components/seo/local-business-jsonld";
import GtmScripts from "@components/analytics/gtm-scripts";
import PageViewTracker from "@components/analytics/page-view-tracker";
import ConsentBanner from "@components/analytics/consent-banner";
import RouteProgress from "@components/common/route-progress";
import { loadSiteConfig, getConfigValue } from "@lib/site-config";
import "@fontsource/open-sans";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/satisfy";
import "react-toastify/dist/ReactToastify.css";
import "../styles/tailwind.css";
import "../styles/custom-plugins.css";
import "../styles/scrollbar.css";
import "../styles/swiper-carousel.css";
import "../styles/blog.css";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://what.com.my";

// Async metadata — `metadata` exports run at build time and can't await
// site-config. generateMetadata runs per-render and pulls site name /
// tagline / locale from the admin-editable store.
//
// metadataBase anchors all relative URLs (canonical, OG image,
// twitter:image). It comes from env, not site-config, because the public
// origin is a deployment concern, not an editorial one.
export async function generateMetadata(): Promise<Metadata> {
  const cfg = await loadSiteConfig();
  const name = getConfigValue(cfg, "site_name", "Storefront");
  const tagline = getConfigValue(cfg, "site_tagline");
  const locale = getConfigValue(cfg, "business_locale", "en_US");

  // OG image: leave images undefined so Next 15 auto-discovers the
  // file-based /opengraph-image route. That route checks site-config's
  // `og_image_url` itself and streams the admin upload when set, so we
  // don't need to fork the metadata layer.
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: tagline || undefined,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: name,
      locale,
      url: "/",
      title: name,
      description: tagline || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: tagline || undefined,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

// Layout is async so it can read business_html_lang for the <html lang>
// attribute. Because loadSiteConfig is React-cache wrapped, this and
// generateMetadata above share a single fetch per render.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cfg = await loadSiteConfig();
  const lang = getConfigValue(cfg, "business_html_lang", "en");

  // Site-config overrides forwarded to the client-side SettingsProvider.
  // Surfaces admin-editable values (logo, customer-support WhatsApp
  // link, …) to header / footer / widgets without each consumer
  // re-fetching.
  const logoUrl = getConfigValue(cfg, "site_logo_url");
  const logoW = Number(getConfigValue(cfg, "site_logo_width")) || undefined;
  const logoH = Number(getConfigValue(cfg, "site_logo_height")) || undefined;
  const whatsappUrl = getConfigValue(cfg, "social_whatsapp");

  const overrides: Record<string, any> = {};
  if (logoUrl) {
    overrides.logo = {
      id: 1,
      original: logoUrl,
      thumbnail: logoUrl,
      width: logoW,
      height: logoH,
    };
  }
  if (whatsappUrl) overrides.whatsappUrl = whatsappUrl;
  const settingsOverrides = Object.keys(overrides).length ? overrides : null;

  return (
    <html lang={lang} dir="ltr">
      <head>
        {/* Server component — consent defaults + GTM loader render in head. */}
        <GtmScripts position="head" />
      </head>
      <body>
        <RouteProgress />
        <GtmScripts position="body" />
        <SEOHead />
        <LocalBusinessJsonLd />
        <Providers settingsOverrides={settingsOverrides}>
          <Shell>{children}</Shell>
        </Providers>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <ConsentBanner />
      </body>
    </html>
  );
}
