"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import ProductSingleDetails from "@components/product/product-single-details";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import { useParams } from "next/navigation";
import Spinner from "@components/ui/loaders/spinner/spinner";
import dynamic from "next/dynamic";
import { useProductQuery } from "@framework/products/products.query";

const RelatedProducts = dynamic(() => import("@containers/related-products"));

export default function ProductPageClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  const { data: product, isLoading } = useProductQuery(slug);

  if (isLoading || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner showText={false} />
      </div>
    );
  }

  return (
    <>
      <Divider className="mb-0" />
      <Container>
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <ProductSingleDetails product={product} />
        <RelatedProducts
          products={(product as any)?.related_products}
          currentProductId={(product as any)?.id}
          sectionHeading="text-related-products"
        />
        <Subscription />
      </Container>
    </>
  );
}
