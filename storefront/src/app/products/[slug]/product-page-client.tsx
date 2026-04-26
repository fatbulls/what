"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import ProductSingleDetails from "@components/product/product-single-details";
import Divider from "@components/ui/divider";
import { BreadcrumbItems } from "@components/common/breadcrumb";
import ActiveLink from "@components/ui/active-link";
import { useTranslation } from "next-i18next";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useProductQuery } from "@framework/products/products.query";
import ProductDetailSkeleton from "./product-detail-skeleton";

const RelatedProducts = dynamic(() => import("@containers/related-products"));

export default function ProductPageClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const { t } = useTranslation("common");

  const { data: product, isLoading } = useProductQuery(slug);

  // Reuse the same skeleton shown by loading.tsx during route Suspense so
  // the handoff from route transition → client data fetch is seamless —
  // no spinner flash on top of the already-running progress bar.
  if (isLoading || !product) {
    return (
      <Container className="py-8 lg:py-10">
        <ProductDetailSkeleton />
      </Container>
    );
  }

  // Visible breadcrumb mirrors the server-side BreadcrumbList JSON-LD
  // (Home → Category → Product). Falls back to "Shop" pointing at
  // /search when the product has no parent category, keeping the
  // 3-level structure stable for both crawlers and users.
  const cat = (product as any)?.categories?.[0];

  return (
    <>
      <Divider className="mb-0" />
      <Container>
        <div className="pt-8">
          <BreadcrumbItems separator="/">
            <ActiveLink
              href="/"
              activeClassName="font-semibold text-heading"
            >
              <a>{t("breadcrumb-home")}</a>
            </ActiveLink>
            {cat?.slug ? (
              <ActiveLink
                href={`/category/${cat.slug}`}
                activeClassName="font-semibold text-heading"
              >
                <a className="capitalize">{cat.name}</a>
              </ActiveLink>
            ) : null}
            <span className="capitalize text-body line-clamp-1">
              {(product as any)?.name}
            </span>
          </BreadcrumbItems>
        </div>
        <ProductSingleDetails product={product} />
        <RelatedProducts
          product={product}
          currentProductId={(product as any)?.id}
          sectionHeading="text-related-products"
        />
        <Subscription />
      </Container>
    </>
  );
}
