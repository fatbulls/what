import React, { useMemo } from "react";
import { useProductsInfiniteQuery } from "@framework/products/products.query";
import ProductInfiniteGrid from "@components/product/product-infinite-grid";

type Props = {
  shopId: string;
};

const ShopProductsGrid: React.FC<Props> = ({ shopId }) => {
  const {
    isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
  } = useProductsInfiniteQuery({
    ...(Boolean(shopId) && { shop_id: Number(shopId) }),
  });

  const listName = useMemo(() => {
    const firstProduct = data?.pages?.[0]?.data?.[0];
    if (firstProduct?.shop?.name) {
      return `${firstProduct.shop.name} products`;
    }
    return "Shop products";
  }, [data?.pages]);

  if (error) return <p>{error.message}</p>;

  return (
    <ProductInfiniteGrid
      loading={isLoading}
      data={data}
      hasNextPage={hasNextPage}
      loadingMore={loadingMore}
      fetchNextPage={fetchNextPage}
      listName={listName}
      listId={shopId ? `shop-${shopId}` : "shop-products"}
    />
  );
};

export default ShopProductsGrid;
