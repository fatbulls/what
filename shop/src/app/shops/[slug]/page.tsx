"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import ShopsSingleDetails from "@components/shops/shops-single-details";
import { Seo } from "@components/seo";
import { stripHtml, ensureAbsoluteUrl } from "@utils/seo";
import { siteSettings } from "@settings/site.settings";
import { useSettings } from "@contexts/settings.context";


export default function ShopDetailsPage({ data }: any) {
  const settings = useSettings();
  const shop = data?.shop;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    settings?.seo?.canonicalUrl ??
    siteSettings?.author?.websiteUrl;
  const canonicalPath = shop?.slug ? `/shops/${shop.slug}` : "/shops";
  const description = stripHtml(shop?.description ?? "");
  const ogImage = ensureAbsoluteUrl(
    shop?.logo?.original ?? shop?.cover_image?.original,
    baseUrl
  );
  return (
    <div className="border-t border-gray-300">
      <Seo
        pageName={shop?.name ?? "Shop"}
        title={shop?.name}
        description={description}
        canonicalPath={canonicalPath}
        ogImage={ogImage}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Shops", item: "/shops" },
          { name: shop?.name ?? "Shop", item: canonicalPath },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: shop?.name,
            description,
            image: ogImage,
          },
        }}
      />
      {shop && <ShopsSingleDetails data={shop} />}
      <Container>
        <Subscription />
      </Container>
    </div>
  );
}

