import type { Metadata } from "next";
import { sdk } from "@lib/medusa";
import ProductPageClient from "./product-page-client";
import { breadcrumbList } from "@lib/jsonld";

interface PageParams {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>(
      "/store/regions"
    );
    const query: Record<string, any> = {
      handle: slug,
      limit: 1,
      // Medusa relation expansion needs the leading `*` — bare
      // `categories` returns no children (Categories is null),
      // breaking the breadcrumb's parent crumb on PDPs.
      fields:
        "id,title,subtitle,description,thumbnail,*images,*variants.calculated_price,variants.sku,*categories",
    };
    if (regions?.[0]?.id) query.region_id = regions[0].id;
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      { query }
    );
    return products?.[0] ?? null;
  } catch {
    return null;
  }
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product" };
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://194.233.77.181:3003";
  const imageUrl =
    product.thumbnail ||
    product.images?.[0]?.url ||
    `${baseUrl}/assets/placeholder/card-small.svg`;
  return {
    title: product.title,
    description:
      product.subtitle ||
      (product.description ?? "").replace(/<[^>]+>/g, "").slice(0, 160),
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.title,
      description: product.subtitle ?? undefined,
      images: imageUrl ? [imageUrl] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  const cp = product?.variants?.[0]?.calculated_price;
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: (product.description ?? "").replace(/<[^>]+>/g, ""),
        image:
          product.thumbnail ||
          product.images?.[0]?.url ||
          undefined,
        sku: product.variants?.[0]?.sku ?? undefined,
        offers: cp?.calculated_amount
          ? {
              "@type": "Offer",
              priceCurrency: (cp.currency_code ?? "myr").toUpperCase(),
              price: cp.calculated_amount,
              availability: "https://schema.org/InStock",
              url: `/products/${slug}`,
            }
          : undefined,
      }
    : null;

  // Use the first category as the crumb parent. Most products belong to
  // exactly one category in this catalog; if they belong to multiple,
  // the first is fine — Google only requires the breadcrumb reflect a
  // path the user *could* take, not every possible path.
  const parentCategory = product?.categories?.[0];
  const crumb = product
    ? breadcrumbList(
        [
          { name: "Home", url: "/" },
          parentCategory
            ? {
                name: parentCategory.name,
                url: `/category/${parentCategory.handle}`,
              }
            : null,
          { name: product.title, url: `/products/${slug}` },
        ].filter(Boolean) as { name: string; url: string }[],
      )
    : null;

  return (
    <>
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      ) : null}
      {crumb ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }}
        />
      ) : null}
      {product ? (
        <div className="sr-only" aria-hidden="false">
          <h1>{product.title}</h1>
          {product.subtitle ? <p>{product.subtitle}</p> : null}
          {product.description ? (
            <p>{String(product.description).replace(/<[^>]+>/g, "").slice(0, 500)}</p>
          ) : null}
        </div>
      ) : null}
      <ProductPageClient />
    </>
  );
}
