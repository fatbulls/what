import type { Metadata } from "next";
import CategoryClient from "./page-client";
import { sdk } from "@lib/medusa";
import { breadcrumbList } from "@lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadCategory(slug: string) {
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: any[];
    }>("/store/product-categories", {
      query: {
        handle: slug,
        limit: 1,
        fields: "*products,*parent_category",
      },
    });
    return product_categories?.[0] ?? null;
  } catch {
    return null;
  }
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} — curated selection delivered across the region.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: category.name,
      description: category.description ?? undefined,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await loadCategory(slug);
  const products = category?.products ?? [];
  const parent = category?.parent_category;

  const crumb = category
    ? breadcrumbList(
        [
          { name: "Home", url: "/" },
          parent
            ? { name: parent.name, url: `/category/${parent.handle}` }
            : null,
          { name: category.name, url: `/category/${slug}` },
        ].filter(Boolean) as { name: string; url: string }[],
      )
    : null;

  return (
    <>
      {crumb ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }}
        />
      ) : null}
      <div className="sr-only" aria-hidden="false">
        <h1>{category?.name ?? "Category"}</h1>
        {category?.description ? <p>{category.description}</p> : null}
        <ul>
          {products.slice(0, 24).map((p: any) => (
            <li key={p.id}>
              <a href={`/products/${p.handle}`}>{p.title}</a>
            </li>
          ))}
        </ul>
      </div>
      <CategoryClient
        categoryName={category?.name ?? null}
        parentCategory={
          parent ? { name: parent.name, slug: parent.handle } : null
        }
      />
    </>
  );
}
