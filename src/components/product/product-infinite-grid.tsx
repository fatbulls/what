import ProductCard from "@components/product/product-card";
import Button from "@components/ui/button";
import type { FC } from "react";
import { PaginatedProduct } from "@framework/products/products.query";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { useTranslation } from "next-i18next";
import { Product } from "@framework/types";
import isEmpty from "lodash/isEmpty";
import NotFound from "@components/404/not-found";
import { useEffect, useMemo } from "react";
import { trackViewItemList } from "@lib/analytics";

interface ProductGridProps {
  className?: string;
  loading: boolean;
  data: any;
  hasNextPage: boolean | undefined;
  loadingMore: any;
  fetchNextPage: () => void;
  listName?: string;
  listId?: string;
}

export const ProductInfiniteGrid: FC<ProductGridProps> = ({
  className = "",
  loading,
  data,
  hasNextPage,
  loadingMore,
  fetchNextPage,
  listName,
  listId = "search-results",
}) => {
  const { t } = useTranslation();
  const resolvedListName = listName ?? t("text-search-results");
  const products = useMemo(() => {
    if (!data?.pages?.length) {
      return [] as Product[];
    }
    return data.pages.reduce((acc: Product[], page: PaginatedProduct) => {
      if (Array.isArray(page?.data)) {
        acc.push(...page.data);
      }
      return acc;
    }, [] as Product[]);
  }, [data?.pages]);

  const productsKey = useMemo(
    () =>
      products.map((product) => product?.id ?? product?.slug ?? "unknown").join("|"),
    [products]
  );

  useEffect(() => {
    if (loading) return;
    if (!products.length) return;
    trackViewItemList({ products, listName: resolvedListName, listId });
  }, [loading, productsKey, resolvedListName, listId]);

  // If no product found
  if (!loading && isEmpty(products)) {
    return <NotFound text={t("text-no-products-found")} />;
  }

  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
      >
        {loading && !products.length ? (
          <ProductFeedLoader limit={20} uniqueKey="search-product" />
        ) : (
          products.map((product: Product, index: number) => (
            <ProductCard
              key={`product--key${product.id}`}
              product={product}
              variant="grid"
              listName={resolvedListName}
              listId={listId}
              listIndex={index}
            />
          ))
        )}
      </div>
      <div className="text-center pt-8 xl:pt-14">
        {hasNextPage && (
          <Button
            loading={loadingMore}
            disabled={loadingMore}
            onClick={() => fetchNextPage()}
            variant="slim"
          >
            {t("button-load-more")}
          </Button>
        )}
      </div>
    </>
  );
};

export default ProductInfiniteGrid;
