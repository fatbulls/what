"use client";

import SectionHeader from "@components/common/section-header";
import ProductCard from "@components/product/product-card";
import ProductCardLoader from "@components/ui/loaders/product-card-loader";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo } from "react";
import { trackViewItemList } from "@lib/analytics";
import { useProductsQuery } from "@framework/products/products.query";
import type { Product } from "@framework/types";

interface ProductsProps {
  sectionHeading: string;
  className?: string;
  /** The current product — we pull its primary category/tag to find siblings. */
  product?: any;
  currentProductId?: any;
  /** Optional override: if the caller already has a list, just render it. */
  products?: any;
  limit?: number;
}

// Medusa's StoreProduct doesn't have a `related_products` field (that was a
// ChawkBazar/Laravel artifact). We derive the list client-side: query the
// same catalog filtered by the current product's primary category or first
// tag, drop the current product, cap at `limit`. If the product is
// uncategorized and untagged, the section renders nothing.
const RelatedProducts: React.FC<ProductsProps> = ({
  sectionHeading,
  className = "mb-9 lg:mb-10 xl:mb-14",
  product,
  currentProductId,
  products: explicitProducts,
  limit = 10,
}) => {
  const { t } = useTranslation("common");

  const categorySlug: string | undefined = product?.categories?.[0]?.slug;
  const tagValue: string | undefined =
    typeof product?.tags?.[0] === "string"
      ? product.tags[0]
      : product?.tags?.[0]?.value;

  // Prefer category (richer + more specific); fall back to tag.
  const queryByCategory = useProductsQuery(
    { limit: limit + 1, category: categorySlug } as any,
    { enabled: !explicitProducts && !!categorySlug } as any,
  );
  const queryByTag = useProductsQuery(
    { limit: limit + 1, tags: tagValue } as any,
    {
      enabled: !explicitProducts && !categorySlug && !!tagValue,
    } as any,
  );

  const resolvedProducts: Product[] = useMemo(() => {
    if (Array.isArray(explicitProducts)) return explicitProducts;
    const data =
      (queryByCategory as any)?.data?.data ??
      (queryByTag as any)?.data?.data ??
      [];
    return data;
  }, [explicitProducts, queryByCategory, queryByTag]);

  const filtered = useMemo(() => {
    return resolvedProducts
      .filter((p: any) => p && p.id !== currentProductId)
      .slice(0, limit);
  }, [resolvedProducts, currentProductId, limit]);

  const productIdsKey = useMemo(
    () =>
      filtered
        .map((p: any) => p?.id ?? p?.slug ?? "unknown")
        .join("|"),
    [filtered],
  );

  const listName = t(sectionHeading);
  const listId = `related-${currentProductId ?? "product"}`;

  useEffect(() => {
    if (!filtered.length) return;
    trackViewItemList({ products: filtered, listName, listId });
  }, [listName, listId, productIdsKey, filtered.length]);

  // Is a query actually active and still loading?
  const isLoading =
    !explicitProducts &&
    (((queryByCategory as any)?.isLoading && !!categorySlug) ||
      ((queryByTag as any)?.isLoading && !categorySlug && !!tagValue));

  // Nothing to render:
  // - No explicit list AND no category/tag to look up → product has no
  //   siblings to fetch. Hide the section.
  // - Loaded result came back empty → hide (empty section header is noise).
  if (!isLoading && !filtered.length) return null;

  const gridClass =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8";

  return (
    <div className={className}>
      <SectionHeader sectionHeading={sectionHeading} />
      <div className={gridClass}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <ProductCardLoader key={`related-skel-${i}`} />
            ))
          : filtered.map((p: any, index: number) => (
              <ProductCard
                key={`product--key${p.id}`}
                product={p}
                imgWidth={340}
                imgHeight={440}
                variant="grid"
                imgLoading="lazy"
                imgFetchPriority="low"
                listName={listName}
                listId={listId}
                listIndex={index}
              />
            ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
