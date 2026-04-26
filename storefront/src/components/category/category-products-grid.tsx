"use client";

import React, { useMemo } from "react";
import { useProductsInfiniteQuery } from "@framework/products/products.query";
import ProductInfiniteGrid from "@components/product/product-infinite-grid";

type Props = {
  classname?: string;
  categorySlug: string;
};

const CategoryProductsGrid: React.FC<Props> = ({
  classname = "",
  categorySlug,
}) => {
  const {
    isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
  } = useProductsInfiniteQuery({
    category: categorySlug && categorySlug,
  });

  const listName = useMemo(() => {
    const firstProduct = data?.pages?.[0]?.data?.[0];
    const category = firstProduct?.categories?.find((entry: any) => entry?.name);
    if (category?.name) {
      return `${category.name} products`;
    }
    if (categorySlug) {
      return `Category: ${categorySlug}`;
    }
    return "Category products";
  }, [categorySlug, data?.pages]);

  if (error) return <p>{error.message}</p>;

  return (
    <ProductInfiniteGrid
      className={classname}
      loading={isLoading}
      data={data}
      hasNextPage={hasNextPage}
      loadingMore={loadingMore}
      fetchNextPage={fetchNextPage}
      listName={listName}
      listId={categorySlug ? `category-${categorySlug}` : "category-products"}
    />
  );
};

export default CategoryProductsGrid;
