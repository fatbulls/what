import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useSettings } from "@contexts/settings.context";
import { siteSettings } from "@settings/site.settings";
import {
  BreadcrumbItem,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildWebPageJsonLd,
  defaultSeoFallbacks,
  ensureAbsoluteUrl,
  stripHtml,
  truncate,
} from "@utils/seo";

type JsonLdInput = Record<string, any> | Array<Record<string, any>>;

interface SeoProps {
  pageName: string;
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "product" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  schema?: {
    type: "product" | "article" | "webPage";
    data: Record<string, any>;
  };
  additionalJsonLd?: JsonLdInput;
  noIndex?: boolean;
  disableDescriptionFallback?: boolean;
  appendSiteTitle?: boolean;
}

const resolveBaseUrl = (settings: any) => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const settingsUrl = settings?.seo?.canonicalUrl;
  const authorUrl = siteSettings?.author?.websiteUrl;
  return (
    envUrl?.replace(/\/+$/, "") ||
    settingsUrl?.replace(/\/+$/, "") ||
    authorUrl?.replace(/\/+$/, "") ||
    "https://becauseyou.com.my"
  );
};

const normalizeDescription = (
  description?: string,
  { allowFallback = true }: { allowFallback?: boolean } = {}
) => {
  const plainText = stripHtml(description ?? "");
  if (!plainText) {
    return allowFallback ? defaultSeoFallbacks.description : "";
  }
  return truncate(plainText, 160);
};

const isArray = (value: unknown): value is any[] => Array.isArray(value);

const toJsonLdArray = (value?: JsonLdInput) => {
  if (!value) {
    return [];
  }
  return (isArray(value) ? value : [value]).filter(Boolean);
};

const Seo = ({
  pageName,
  title,
  description,
  canonicalPath,
  canonicalUrl,
  ogImage,
  ogTitle,
  ogDescription,
  ogType = "website",
  publishedTime,
  modifiedTime,
  breadcrumbs,
  schema,
  additionalJsonLd,
  noIndex = false,
  disableDescriptionFallback = false,
  appendSiteTitle = true,
}: SeoProps) => {
  const settings = useSettings();
  const router = useRouter();

  const siteTitleFromSettings = settings?.siteTitle ?? siteSettings?.name ?? defaultSeoFallbacks.titleSuffix;

  const baseUrl = useMemo(() => resolveBaseUrl(settings), [settings]);
  const pathFromRouter = router?.asPath?.split("?")[0] ?? "/";
  const canonical = useMemo(() => {
    if (canonicalUrl) {
      return ensureAbsoluteUrl(canonicalUrl, baseUrl) ?? baseUrl;
    }
    if (canonicalPath) {
      return ensureAbsoluteUrl(canonicalPath, baseUrl) ?? baseUrl;
    }
    return ensureAbsoluteUrl(pathFromRouter || "/", baseUrl) ?? baseUrl;
  }, [canonicalUrl, canonicalPath, baseUrl, pathFromRouter]);

  const explicitTitle = (title ?? "").trim();
  const normalizedDescription = normalizeDescription(description, {
    allowFallback: !disableDescriptionFallback,
  });

  const fallbackTitle = `${pageName} – ${siteTitleFromSettings}`;

  const finalTitle = useMemo(() => {
    if (!explicitTitle) {
      return fallbackTitle;
    }
    if (!appendSiteTitle) {
      return explicitTitle;
    }
    const suffix = siteTitleFromSettings?.trim();
    if (!suffix) {
      return explicitTitle;
    }
    const normalizedTitle = explicitTitle.trim();
    const normalizedSuffix = suffix.toLowerCase();
    if (normalizedTitle.toLowerCase().includes(normalizedSuffix)) {
      return normalizedTitle;
    }
    return `${normalizedTitle} | ${suffix}`;
  }, [appendSiteTitle, explicitTitle, fallbackTitle, siteTitleFromSettings]);

  const finalDescription = normalizedDescription.trim();
  const hasDescription = finalDescription.length > 0;

  const resolvedOgTitle = ogTitle ?? finalTitle;
  const resolvedOgDescription = ogDescription ?? (hasDescription ? finalDescription : undefined);
  const resolvedOgImage = ensureAbsoluteUrl(
    ogImage ?? settings?.seo?.ogImage?.original ?? settings?.logo?.original ?? defaultSeoFallbacks.image,
    baseUrl
  );

  const structuredData = useMemo(() => {
    const entries: Array<Record<string, any>> = [];

    if (breadcrumbs?.length) {
      entries.push(buildBreadcrumbJsonLd(baseUrl, breadcrumbs));
    }

    if (schema) {
      const { type, data } = schema;
      if (type === "product") {
        entries.push(
          buildProductJsonLd({
            ...data,
            url: canonical,
          })
        );
      } else if (type === "article") {
        entries.push(
          buildArticleJsonLd({
            ...data,
            url: canonical,
            publisherName: data?.publisherName ?? siteTitleFromSettings,
            publisherLogo:
              ensureAbsoluteUrl(
                data?.publisherLogo ?? settings?.logo?.original ?? defaultSeoFallbacks.image,
                baseUrl
              ),
          })
        );
      } else {
        entries.push(
          buildWebPageJsonLd({
            title: finalTitle,
            description: finalDescription,
            url: canonical,
            image: resolvedOgImage,
          })
        );
      }
    } else {
      entries.push(
        buildWebPageJsonLd({
          title: finalTitle,
          description: finalDescription,
          url: canonical,
          image: resolvedOgImage,
        })
      );
    }

    toJsonLdArray(additionalJsonLd).forEach((item) => {
      entries.push(item);
    });

    return entries;
  }, [
    additionalJsonLd,
    baseUrl,
    breadcrumbs,
    canonical,
    finalDescription,
    finalTitle,
    resolvedOgImage,
    schema,
    settings?.logo?.original,
    settings?.siteTitle,
    siteTitleFromSettings,
  ]);

  return (
    <Head>
      <title>{finalTitle}</title>
      {hasDescription ? <meta name="description" content={finalDescription} /> : null}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={resolvedOgTitle} />
      {resolvedOgDescription ? <meta property="og:description" content={resolvedOgDescription} /> : null}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      {resolvedOgImage ? <meta property="og:image" content={resolvedOgImage} /> : null}
      <meta property="og:site_name" content={siteTitleFromSettings ?? defaultSeoFallbacks.titleSuffix} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      {resolvedOgDescription ? <meta name="twitter:description" content={resolvedOgDescription} /> : null}
      {resolvedOgImage ? <meta name="twitter:image" content={resolvedOgImage} /> : null}
      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="googlebot" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      {structuredData.map((item, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Head>
  );
};

export default Seo;
