import SectionHeader from "@components/common/section-header";
import ProductCard from "@components/product/product-card";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo } from "react";
import { trackViewItemList } from "@lib/analytics";

interface ProductsProps {
	sectionHeading: string;
	className?: string;
  products: any;
  currentProductId: any;
}

const RelatedProducts: React.FC<ProductsProps> = ({
	sectionHeading,
	className = "mb-9 lg:mb-10 xl:mb-14",
  products,
  currentProductId
}) => {
	const { t } = useTranslation("common");
	const filteredProducts = useMemo(
		() =>
			Array.isArray(products)
				? products.filter((product: any) => product && product.id !== currentProductId)
				: [],
		[products, currentProductId]
	);
	const productIdsKey = useMemo(
		() =>
			filteredProducts.map((product: any) => product?.id ?? product?.slug ?? "unknown").join("|"),
		[filteredProducts]
	);
	const listName = t(sectionHeading);
	const listId = `related-${currentProductId ?? "product"}`;

	useEffect(() => {
		if (!filteredProducts.length) return;
		trackViewItemList({ products: filteredProducts, listName, listId });
	}, [listName, listId, productIdsKey, filteredProducts.length]);
	return (
		<div className={className}>
			<SectionHeader sectionHeading={sectionHeading} />
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
	        {filteredProducts.map((product: any, index: number) => (
	            <ProductCard
	              key={`product--key${product.id}`}
	              product={product}
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
