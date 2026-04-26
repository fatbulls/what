"use client";

import Container from "@components/ui/container";
import BlogBanner from "@components/blog/blog-banner";
import BlogList from "@components/blog/blog-list";
import { useBlogsQuery } from "@framework/blog/blog.query";

export default function BlogPageClient() {
  const { data, isLoading } = useBlogsQuery();
  return (
    <>
      <BlogBanner />
      <Container>
        <BlogList blogs={data?.blogs} isLoading={isLoading} />
      </Container>
    </>
  );
}
