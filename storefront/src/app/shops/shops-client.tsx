"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import ShopsPageContent from "@components/shops/shops-page-content";

export default function ShopsClient() {
  return (
    <>
      <ShopsPageContent />
      <Container>
        <Subscription />
      </Container>
    </>
  );
}
