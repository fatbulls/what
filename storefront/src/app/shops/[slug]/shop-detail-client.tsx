"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import ShopsSingleDetails from "@components/shops/shops-single-details";
import { useParams } from "next/navigation";

// Vendor-store details rendering. The Medusa storefront does not yet
// expose a per-shop endpoint, so this currently relies on whatever
// `ShopsSingleDetails` is wired to fetch internally. Until that's
// connected, the route is `noindex` (set in page.tsx) so an empty
// detail page can't enter the search index.
export default function ShopDetailClient() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  return (
    <div className="border-t border-gray-300">
      {slug ? <ShopsSingleDetails data={{ slug } as any} /> : null}
      <Container>
        <Subscription />
      </Container>
    </div>
  );
}
