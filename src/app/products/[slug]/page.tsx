import type { Metadata } from "next";
import { sdk } from "@lib/medusa";
import ProductPageClient from "./product-page-client";

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
      fields:
        "id,title,subtitle,description,thumbnail,images.url,variants.calculated_price,variants.sku,categories",
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
  const jsonLd = product
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
              priceCurrency: (cp.currency_code ?? "usd").toUpperCase(),
              price: cp.calculated_amount,
              availability: "https://schema.org/InStock",
            }
          : undefined,
      }
    : null;
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
