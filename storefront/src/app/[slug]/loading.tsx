import Container from "@components/ui/container";
import BlogDetailSkeleton from "@components/blog/blog-detail-skeleton";

export default function Loading() {
  return (
    <Container className="py-8 lg:py-10">
      <BlogDetailSkeleton />
    </Container>
  );
}
