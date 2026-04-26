"use client";

import { useRouter } from "next/router";
import { useOrderQuery } from "@framework/orders/orders.query";
import OrderView from "@components/orders/order-view";
import OrderViewSkeleton from "@components/orders/order-view-skeleton";
import Divider from "@components/ui/divider";
import Subscription from "@components/common/subscription";
import Container from "@components/ui/container";

export default function OldOrder() {
  const { query } = useRouter();
  const trackingNumber =
    typeof query.tracking_number === 'string' ? query.tracking_number : undefined;
  const { data, isLoading } = useOrderQuery({
    tracking_number: trackingNumber,
  });

  if (isLoading) {
    return (
      <>
        <Divider />
        <Container>
          <OrderViewSkeleton />
        </Container>
      </>
    );
  }

  return (
    <>
      <Divider />
      <Container>
        <OrderView order={data?.order} />
        <Subscription />
      </Container>
    </>
  );
}
