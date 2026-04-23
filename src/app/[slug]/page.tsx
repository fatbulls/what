"use client";

import Container from "@components/ui/container";
import BlogBanner from "@components/blog/blog-banner";
import BlogDetail from "@components/blog/blog-detail";
import Spinner from "@components/ui/loaders/spinner/spinner";
import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import { sdk } from "@lib/medusa";
import { adaptBlogPost } from "@framework/utils/adapters";

export default function DynamicBlogPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  const { data, isLoading } = useQuery(
    ["blog-post", slug],
    async () => {
      const res = await sdk.client.fetch<{ post: any }>(
        `/store/blog-posts/${slug}`
      );
      return res.post ? adaptBlogPost(res.post) : null;
    },
    { enabled: !!slug, retry: false }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner showText={false} />
      </div>
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
