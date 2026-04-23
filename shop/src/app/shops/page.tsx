"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import ShopsPageContent from "@components/shops/shops-page-content";
import { Seo } from "@components/seo";


export default function ShopsPage() {
  const description =
    "Explore Because You Florist partner boutiques and discover local florists across Klang Valley.";
  return (
    <>
      <Seo
        pageName="Shops"
        title="Our Shops"
        description={description}
        canonicalPath="/shops"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Shops", item: "/shops" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Our Shops",
            description,
          },
        }}
      />
      <ShopsPageContent />
      <Container>
        <Subscription />
      </Container>
    </>
  );
}

