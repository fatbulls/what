import type { Metadata } from "next";
import CollectionsClient from "./collections-client";
import { breadcrumbList } from "@lib/jsonld";

interface PageProps {
  params: Promise<{ tags: string }>;
}

function humanize(slug: string) {
  if (!slug) return "Collections";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tags } = await params;
  const human = humanize(tags);
  const description = `Explore curated ${human} selections designed for thoughtful gifting from What Shop.`;
  return {
    title: `${human} Collection`,
    description,
    alternates: { canonical: `/collections/${tags}` },
    openGraph: {
      title: `${human} Collection`,
      description,
      type: "website",
      url: `/collections/${tags}`,
    },
  };
}

export default async function CollectionsPage({ params }: PageProps) {
  const { tags } = await params;
  const human = humanize(tags);
  const crumb = breadcrumbList([
    { name: "Home", url: "/" },
    { name: "Collections", url: "/search" },
    { name: human, url: `/collections/${tags}` },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }}
      />
      <CollectionsClient />
    </>
  );
}
