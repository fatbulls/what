"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import CategoryBanner from "@containers/category-banner";
import CategoryProductsGrid from "@components/category/category-products-grid";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { BreadcrumbItems } from "@components/common/breadcrumb";
import ActiveLink from "@components/ui/active-link";
import { useTranslation } from "next-i18next";
import { useParams } from "next/navigation";

interface CategoryPageProps {
  // Hydrated from the server page so the breadcrumb + heading have a
  // friendly name on first paint instead of a blank "Category" stub.
  categoryName: string | null;
  parentCategory: { name: string; slug: string } | null;
}

export default function CategoryClient({
  categoryName,
  parentCategory,
}: CategoryPageProps) {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { t } = useTranslation("common");

  if (!slug) {
    return (
      <Container className="py-8 lg:py-10">
        <ProductFeedLoader limit={12} />
      </Container>
    );
  }

  const displayName =
    categoryName ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="border-t-2 border-borderBottom">
      <Container>
        <div className="pt-6">
          <BreadcrumbItems separator="/">
            <ActiveLink
              href="/"
              activeClassName="font-semibold text-heading"
            >
              <a>{t("breadcrumb-home")}</a>
            </ActiveLink>
            {parentCategory ? (
              <ActiveLink
                href={`/category/${parentCategory.slug}`}
                activeClassName="font-semibold text-heading"
              >
                <a className="capitalize">{parentCategory.name}</a>
              </ActiveLink>
            ) : null}
            <span className="capitalize text-body line-clamp-1">
              {displayName}
            </span>
          </BreadcrumbItems>
        </div>
        <CategoryBanner className="my-4" category={null as any} />
        <div className="pb-16 lg:pb-20">
          <CategoryProductsGrid
            classname="3xl:grid-cols-6"
            categorySlug={slug}
          />
        </div>
        <Subscription />
      </Container>
    </div>
  );
}
