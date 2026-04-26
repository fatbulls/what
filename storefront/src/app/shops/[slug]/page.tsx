import type { Metadata } from "next";
import ShopDetailClient from "./shop-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Per-shop landing page. Multi-vendor isn't wired up yet on the Medusa
// side, so the page is `noindex` to prevent thin / empty stubs from
// entering search until a real shop endpoint exists.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const human = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Shop";
  return {
    title: human,
    description: `Browse ${human} on What Shop.`,
    alternates: { canonical: `/shops/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default function ShopDetailPage() {
  return <ShopDetailClient />;
}
