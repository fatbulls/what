import { siteSettings } from "@settings/site.settings";

export const DEFAULT_SITE_NAME = "BecauseYou Shop";
export const DEFAULT_PAGE_NAME = "Page";
export const DEFAULT_DESCRIPTION =
  "BecauseYou Shop, your trusted ecommerce platform for bespoke floral gifts and surprise deliveries.";

const stripTrailingSlash = (value?: string | null) =>
  value ? value.replace(/\/+$/, "") : value ?? undefined;

export const ensureAbsoluteUrl = (
  value?: string | null,
  baseUrl?: string | null
): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedBase = stripTrailingSlash(baseUrl) ?? stripTrailingSlash(siteSettings?.author?.websiteUrl) ?? "";
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  if (!normalizedBase) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}`;
};

export const stripHtml = (value?: string | null) =>
  value ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

export const extractFirstParagraphText = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\r?\n+/g, " ");
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gis;
  let fallback = "";
  let match: RegExpExecArray | null;

  while ((match = paragraphRegex.exec(normalized))) {
    const text = stripHtml(match[1]);
    if (!text) {
      continue;
    }
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) {
      continue;
    }
    if (!fallback) {
      fallback = cleaned;
    }
    if (cleaned.length >= 40) {
      return cleaned;
    }
  }

  if (fallback) {
    return fallback;
  }

  return stripHtml(value);
};

export const truncate = (value: string, length = 160) => {
  if (value.length <= length) {
    return value;
  }
  return `${value.substring(0, length - 1).trim()}…`;
};

const DISCLAIMER_PATTERNS: RegExp[] = [
  /all products are subject to availability/i,
  /subject to availability/i,
  /in the event of any supply difficulties/i,
  /if the flowers we have received/i,
  /we reserve the right/i,
  /product images? (are|is) for illustrative purposes/i,
  /terms? and conditions/i,
  /alternate product of a similar style/i,
  /may vary slightly/i,
  /may substitute/i,
  /substitute any product/i,
];

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const isDisclaimer = (value: string) => DISCLAIMER_PATTERNS.some((pattern) => pattern.test(value));

const extractTagText = (html: string, tag: string) => {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "gis");
  const results: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const text = normalizeWhitespace(stripHtml(match[1]));
    if (text) {
      results.push(text);
    }
  }

  return results;
};

const pickMeaningfulSnippet = (html?: string | null) => {
  if (!html) {
    return "";
  }

  const paragraphs = extractTagText(html, "p");
  const listItems = extractTagText(html, "li");
  const candidates = [...paragraphs, ...listItems];

  for (const text of candidates) {
    if (text.length < 40) {
      continue;
    }
    if (isDisclaimer(text)) {
      continue;
    }
    return text;
  }

  const fallbackText = normalizeWhitespace(stripHtml(html));
  if (!fallbackText) {
    return "";
  }

  const sentences = fallbackText.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    const cleaned = sentence.trim();
    if (cleaned.length < 40) {
      continue;
    }
    if (isDisclaimer(cleaned)) {
      continue;
    }
    return cleaned;
  }

  return fallbackText;
};

const ensureSentence = (value: string) => {
  const trimmed = normalizeWhitespace(value);
  if (!trimmed) {
    return "";
  }
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const formatList = (items: string[]) => {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  const allButLast = items.slice(0, -1).join(", ");
  const last = items[items.length - 1];
  return `${allButLast}, and ${last}`;
};

const formatCurrency = (value: string | number | null | undefined, currency = "MYR") => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const numeric = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }
  try {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(numeric);
  } catch (error) {
    return `${currency} ${numeric.toFixed(0)}`;
  }
};

export const buildProductSeoDescription = (
  product: any,
  {
    currency = "MYR",
    deliveryText = "Same-day delivery across Klang Valley.",
  }: { currency?: string; deliveryText?: string } = {}
) => {
  const descriptionHtml = typeof product?.description === "string" ? product.description : undefined;
  const primarySnippet = pickMeaningfulSnippet(descriptionHtml);
  const snippetIsMeaningful = primarySnippet && !isDisclaimer(primarySnippet);

  const name = product?.name ?? "this floral arrangement";
  const typeName =
    typeof product?.product_type === "string"
      ? product.product_type
      : typeof product?.type?.name === "string"
      ? product.type.name
      : undefined;

  const details: string[] = [];

  const categories = Array.isArray(product?.categories)
    ? Array.from(
        new Set(
          product.categories
            .map((category: any) => typeof category?.name === "string" ? category.name : null)
            .filter(Boolean)
        )
      )
    : [];

  const tagNames = Array.isArray(product?.tags)
    ? Array.from(
        new Set(
          product.tags
            .map((tag: any) => (typeof tag?.name === "string" ? tag.name : null))
            .filter(Boolean)
        )
      )
    : [];

  const descriptorParts: string[] = [];
  if (categories.length) {
    descriptorParts.push(categories[0].toLowerCase());
  }
  if (typeName) {
    descriptorParts.push(typeName.toLowerCase());
  }

  const uniqueDescriptorParts = Array.from(
    new Set(
      descriptorParts.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean)
    )
  );

  const descriptorBase = uniqueDescriptorParts.join(" ").trim();
  const descriptor = descriptorBase
    ? descriptorBase.includes("arrangement")
      ? descriptorBase
      : `${descriptorBase} arrangement`
    : "handcrafted floral arrangement";

  const base = ensureSentence(`Discover ${name}, our ${descriptor} from Because You Florist`);

  if (snippetIsMeaningful) {
    details.push(ensureSentence(primarySnippet));
  }

  if (categories.length) {
    const categoryText = formatList(
      categories
        .slice(0, 3)
        .map((categoryName) => categoryName.toLowerCase())
    );
    if (categoryText) {
      details.push(ensureSentence(`Perfect for ${categoryText} celebrations`));
    }
  }

  if (tagNames.length) {
    const tagText = formatList(
      tagNames
        .slice(0, 3)
        .map((tagName) => tagName.toLowerCase())
    );
    if (tagText) {
      details.push(ensureSentence(`Highlights ${tagText} styling cues`));
    }
  }

  const priceValue = product?.sale_price ?? product?.price;
  const priceText = formatCurrency(priceValue, currency);
  if (priceText) {
    details.push(ensureSentence(`Available from ${priceText}`));
  }

  if (deliveryText) {
    details.push(ensureSentence(deliveryText));
  }

  const combined = `${base} ${details.join(" ")}`.trim();
  return truncate(combined);
};

export interface BreadcrumbItem {
  name: string;
  item: string;
}

const cleanObject = <T extends Record<string, unknown>>(obj: T): T => {
  const next = { ...obj } as Record<string, unknown>;
  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete next[key];
    }
  });
  return next as T;
};

export const buildWebPageJsonLd = ({
  title,
  description,
  url,
  image,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
}) =>
  cleanObject({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    primaryImageOfPage: image
      ? {
          "@type": "ImageObject",
          url: image,
        }
      : undefined,
    isPartOf: {
      "@type": "WebSite",
      name: siteSettings?.name ?? DEFAULT_SITE_NAME,
      url,
    },
  });

export const buildProductJsonLd = ({
  name,
  description,
  url,
  images,
  sku,
  brand,
  price,
  priceCurrency,
  availability,
}: {
  name: string;
  description: string;
  url: string;
  images: string[];
  sku?: string;
  brand?: string;
  price?: number | string | null;
  priceCurrency?: string;
  availability?: string;
}) =>
  cleanObject({
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images,
    sku,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    offers:
      price !== undefined && price !== null
        ? {
            "@type": "Offer",
            price: typeof price === "string" ? price : price.toString(),
            priceCurrency: priceCurrency ?? "MYR",
            availability: availability ?? "https://schema.org/InStock",
            url,
          }
        : undefined,
  });

export const buildArticleJsonLd = ({
  headline,
  description,
  url,
  image,
  authorName,
  publisherName,
  publisherLogo,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  datePublished?: string;
  dateModified?: string;
}) =>
  cleanObject({
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image ? [image] : undefined,
    mainEntityOfPage: url
      ? {
          "@type": "WebPage",
          "@id": url,
        }
      : undefined,
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
        }
      : undefined,
    publisher: publisherName
      ? {
          "@type": "Organization",
          name: publisherName,
          logo: publisherLogo
            ? {
                "@type": "ImageObject",
                url: publisherLogo,
              }
            : undefined,
        }
      : undefined,
    datePublished,
    dateModified,
    url,
  });

export const buildBreadcrumbJsonLd = (
  baseUrl: string,
  items: BreadcrumbItem[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: ensureAbsoluteUrl(item.item, baseUrl),
  })),
});

export const defaultSeoFallbacks = {
  titleSuffix: DEFAULT_SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  image: siteSettings?.logo?.url ?? "/assets/images/logo.svg",
};
