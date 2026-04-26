"use client";

import Container from "@components/ui/container";
import BlogBanner from "@components/blog/blog-banner";
import BlogDetail from "@components/blog/blog-detail";
import BlogDetailSkeleton from "@components/blog/blog-detail-skeleton";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@lib/medusa";
import { adaptBlogPost } from "@framework/utils/adapters";

export default function DynamicBlogPageClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ post: any }>(
        `/store/blog-posts/${slug}`
      );
      return res.post ? adaptBlogPost(res.post) : null;
    },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <Container className="py-8 lg:py-10">
        <BlogDetailSkeleton />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-heading">Post not found</h1>
        <p className="mt-2 text-body">
          The article you are looking for may have been moved or removed.
        </p>
      </Container>
    );
  }

  const featuredImage = (data as any)?.image?.original ?? (data as any)?.thumbnail;
  return (
    <>
      <BlogBanner title={(data as any)?.title} image={featuredImage} />
      <Container>
        <BlogDetail blogs={data as any} image={featuredImage} />
      </Container>
    </>
  );
}
