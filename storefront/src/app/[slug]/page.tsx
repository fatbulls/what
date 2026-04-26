import type { Metadata } from "next";
import DynamicBlogPageClient from "./page-client";
import { sdk } from "@lib/medusa";
import { breadcrumbList } from "@lib/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadPost(slug: string) {
  try {
    const res = await sdk.client.fetch<{ post: any }>(
      `/store/blog-posts/${slug}`
    );
    return res.post ?? null;
  } catch {
    return null;
  }
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Blog" };
  const image = post.thumbnail;
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: image ? [image] : undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.author_name ? [post.author_name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) {
    return <DynamicBlogPageClient />;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/${slug}`,
    },
    author: post.author_name
      ? { "@type": "Person", name: post.author_name }
      : undefined,
  };
  const crumb = breadcrumbList([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/${slug}` },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }}
      />
      <article className="sr-only" aria-hidden="false">
        <h1>{post.title}</h1>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
        {post.content ? (
          <div>{String(post.content).slice(0, 2000)}</div>
        ) : null}
      </article>
      <DynamicBlogPageClient />
    </>
  );
}
