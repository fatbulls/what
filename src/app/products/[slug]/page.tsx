import type { Metadata } from "next";
import { sdk } from "@lib/medusa";
import ProductPageClient from "./product-page-client";

interface PageParams {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  try {
    const { products } = await sdk.client.fetch<{ products: any[] }>(
      "/store/products",
      {
        query: {
          handle: slug,
          limit: 1,
          fields: "title,subtitle,description,thumbnail,images.url",
        },
      }
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

export default function ProductPage() {
  return <ProductPageClient />;
}
