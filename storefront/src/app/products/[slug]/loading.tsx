import Container from "@components/ui/container";
import ProductDetailSkeleton from "./product-detail-skeleton";

export default function Loading() {
  return (
    <Container className="py-8 lg:py-10">
      <ProductDetailSkeleton />
    </Container>
  );
}
