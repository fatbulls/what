"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import CategoryBanner from "@containers/category-banner";
import { useRouter } from "next/router";
import CategoryProductsGrid from "@components/category/category-products-grid";
import Spinner from "@components/ui/loaders/spinner/spinner";
import { Seo } from "@components/seo";
import { stripHtml, ensureAbsoluteUrl } from "@utils/seo";
import { useSettings } from "@contexts/settings.context";
import { siteSettings } from "@settings/site.settings";
import type { Category } from "@framework/types";


const toTitleCase = (value?: string) => {
  if (!value) return "Category";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

interface CategoryPageProps {
  category: Category | null;
}

export default function Category({ category }: CategoryPageProps) {
  const router = useRouter();
  const { query } = router;
  const slug = query?.slug as string | undefined;
  const settings = useSettings();

  if (slug === undefined) {
    return <Spinner />;
  }

  if ((router as any)?.isFallback) {
    return <Spinner />;
  }

  const canonicalPath = slug ? `/category/${slug}` : "/category";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    settings?.seo?.canonicalUrl ??
    siteSettings?.author?.websiteUrl;
  const bannerImage = category?.banner_image?.original;
  const ogImage = ensureAbsoluteUrl(bannerImage, baseUrl);
  const description = category?.details
    ? stripHtml(category.details)
    : `${toTitleCase(slug)} collection at BecauseYou Shop.`;

  return (
    <div className="border-t-2 border-borderBottom">
      <Seo
        pageName={category?.name ?? toTitleCase(slug)}
        title={category?.name}
        description={description}
        canonicalPath={canonicalPath}
        ogImage={ogImage}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Categories", item: "/search" },
          { name: category?.name ?? toTitleCase(slug), item: canonicalPath },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: category?.name,
            description,
          },
        }}
      />
      <Container> 
        <CategoryBanner className="my-4" category={category} />
        <div className="pb-16 lg:pb-20">
          <CategoryProductsGrid
            classname="3xl:grid-cols-6"
            categorySlug={query?.slug as string}
          />
        </div>
        <Subscription />
      </Container>
    </div>
  );
}

