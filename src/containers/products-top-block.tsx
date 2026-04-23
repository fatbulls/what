import ProductCard from "@components/product/product-card";
import { usePopularProductsQuery } from "@framework/products/popular-products.query";
import ProductListFeedLoader from "@components/ui/loaders/product-list-feed-loader";
import SectionHeader from "@components/common/section-header";
import Alert from "@components/ui/alert";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo } from "react";
import { trackViewItemList } from "@lib/analytics";

interface Props {
	sectionHeading: string;
	className?: string;
	carouselBreakpoint?: {} | any;
    limit?: number
}

const ProductsTopBlock: React.FC<Props> = ({
    sectionHeading,
    className = "mb-12 md:mb-14 xl:mb-16",
    limit = 6,
}) => {
	const { data, isLoading, error } = usePopularProductsQuery({
		limit: limit,
	});
	const { t } = useTranslation("common");
	const listName = t(sectionHeading);
	const listId = `top-block-${sectionHeading}`;
	const productIdsKey = useMemo(
		() =>
			Array.isArray(data)
				? data
						.map((product) => product?.id ?? product?.slug ?? "unknown")
						.join("|")
				: "",
		[data]
	);

	useEffect(() => {
		if (isLoading) return;
		if (!data?.length) return;
		trackViewItemList({ products: data, listName, listId });
	}, [isLoading, productIdsKey, listName, listId]);

	return (
		<div className={`${className}`}>
			<SectionHeader sectionHeading={sectionHeading} />
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 xl:gap-7 xl:-mt-1.5 2xl:mt-0">
				{error ? (
					<div className="col-span-full">
						<Alert message={error?.message} />
					</div>
				) : isLoading && !data?.length ? (
					<ProductListFeedLoader limit={limit} />
				) : (
					data?.map((product, index) => (
						<ProductCard
							key={`product--key-${product.id}`}
							product={product}
							imgWidth={265}
							imgHeight={265}
							imageContentClassName="flex-shrink-0 w-32 sm:w-44 md:w-40 lg:w-52 2xl:w-56 3xl:w-64"
							contactClassName="ltr:pl-3.5 ltr:sm:pl-5 ltr:md:pl-4 ltr:xl:pl-5 ltr:2xl:pl-6 ltr:3xl:pl-10 rtl:pr-3.5 rtl:sm:pr-5 rtl:md:pr-4 rtl:xl:pr-5 rtl:2xl:pr-6 rtl:3xl:pr-10"
							listName={listName}
							listId={listId}
							listIndex={index}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default ProductsTopBlock;
