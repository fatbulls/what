"use client";

import BannerCard from "@components/common/banner-card";
import Container from "@components/ui/container";
import CategoryBlock from "@containers/category-block";
import BannerWithProducts from "@containers/banner-with-products";
import Divider from "@components/ui/divider";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ProductsFeatured from "@containers/products-featured";
import BannerSliderBlock from "@containers/banner-slider-block";
import Subscription from "@components/common/subscription";
import NewArrivalsProductFeed from "@components/product/feeds/new-arrivals-product-feed";
import { ROUTES } from "@lib/routes";

import {
  modernDemoBanner as banner,
  modernDemoProductBanner as productBanner,
  promotionBanner,
} from "@data/static/banners";

const BlogBanner = dynamic(() => import("@components/blog/blog-index-banner"), {
  ssr: false,
});

const Instagram = dynamic(() => import("@components/common/instagram"), {
  ssr: false,
});

const BlogBannerSkeleton = () => (
  <div className="mb-12 md:mb-14 xl:mb-16">
    <div className="h-48 w-full rounded-md bg-gray-200/80 animate-pulse md:h-60 xl:h-72" />
  </div>
);

const InstagramSkeleton = () => (
  <div className="grid grid-cols-3 md:grid-cols-6 gap-0.5 sm:gap-1 overflow-hidden rounded-md">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="relative w-full overflow-hidden rounded-sm bg-gray-200/80 animate-pulse"
      >
        <span className="block pb-[100%]" />
      </div>
    ))}
  </div>
);

const BannerSliderSkeleton = () => (
  <div className="mb-12 md:mb-14 xl:mb-16 mx-auto max-w-[1920px] overflow-hidden">
    <div className="-mx-32 sm:-mx-44 lg:-mx-60 xl:-mx-72 2xl:-mx-80">
      <div className="h-64 md:h-80 xl:h-[420px] w-full bg-gray-200/80 animate-pulse" />
    </div>
  </div>
);

// 1:1 mirror of becauseyou.com.my's production home layout
// (`shop/src/pages/index.tsx`). The commented-out blocks below are
// intentionally disabled in production — do not re-enable without
// confirming against the live site.
export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? <BannerSliderBlock data={promotionBanner} /> : <BannerSliderSkeleton />}
      <Container>
        <CategoryBlock sectionHeading="text-occasions" variant="rounded" />
        {/*<HomeContent/>*/}
        <ProductsFeatured sectionHeading="text-featured-products" />
        {/*<BannerCard data={banner[0]} href={`${ROUTES.COLLECTIONS}/${banner[0].slug}`} className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0" />*/}
        {/*<BannerCard data={banner[1]} href={`${ROUTES.COLLECTIONS}/${banner[1].slug}`} className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0" />*/}
        <BannerWithProducts
          sectionHeading="text-season-pick"
          categorySlug="/search"
          data={productBanner}
        />
        {/*<PickBottomContent/>*/}
        <NewArrivalsProductFeed />
        {/*<BlogTopContent/>*/}
        {isClient ? <BlogBanner /> : <BlogBannerSkeleton />}
        {/*<CustomerReviews/>*/}
        {/*<HomeFaqs/>*/}
        {isClient ? <Instagram /> : <InstagramSkeleton />}
        <Subscription className="bg-opacity-0 px-5 sm:px-16 xl:px-0 py-12 md:py-14 xl:py-16" />
      </Container>
      <Divider className="mb-0" />
    </>
  );
}
