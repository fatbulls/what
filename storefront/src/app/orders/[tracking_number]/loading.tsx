import Container from "@components/ui/container";
import Divider from "@components/ui/divider";
import OrderViewSkeleton from "@components/orders/order-view-skeleton";

export default function Loading() {
  return (
    <>
      <Divider />
      <Container>
        <OrderViewSkeleton />
      </Container>
    </>
  );
}
