import type { Metadata } from "next";
import BlogPageClient from "./blog-page-client";

const description =
  "Latest floral inspiration, gifting tips, and What Shop updates.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Our Blog",
    description,
    type: "website",
    url: "/blog",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
