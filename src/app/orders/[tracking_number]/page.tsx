"use client";

import NewOrder from "@components/orders/new-order";
import { useRouter } from "next/router";
import PageLoader from "@components/ui/page-loader/page-loader";
import { Seo } from "@components/seo";


export default function OrderPage() {
  const router = useRouter();
  const trackingNumber = router.query?.tracking_number as string | undefined;
  const description = trackingNumber
    ? `Review updates and delivery timeline for order ${trackingNumber} from Because You Florist.`
    : "Review the latest updates for your Because You Florist order.";

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <PageLoader />;
  }

  return (
    <>
      <Seo
        pageName="Order Detail"
        title={trackingNumber ? `Order ${trackingNumber}` : "Order Detail"}
        description={description}
        canonicalPath={trackingNumber ? `/orders/${trackingNumber}` : "/orders"}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Orders", item: "/my-account/orders" },
          {
            name: trackingNumber ? `Order ${trackingNumber}` : "Order Detail",
            item: trackingNumber ? `/orders/${trackingNumber}` : "/orders",
          },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: trackingNumber ? `Order ${trackingNumber}` : "Order Detail",
            description,
          },
        }}
        noIndex
      />
      <NewOrder />
    </>
  );
}

OrderPage.authenticate = true;
