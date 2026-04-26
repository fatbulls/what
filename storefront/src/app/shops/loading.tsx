import Container from "@components/ui/container";
import CategoryListFeedLoader from "@components/ui/loaders/category-list-feed-loader";

export default function Loading() {
  return (
    <Container className="py-8 lg:py-10">
      <CategoryListFeedLoader />
    </Container>
  );
}
