import React from "react";
import SectionHeader from "@components/common/section-header";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import Alert from "@components/ui/alert";
import BlogsCard from "./blogs";

interface ProductsProps {
  sectionHeading: string;
  categorySlug?: string;
  className?: string;
  products?: [];
  loading: boolean;
  error?: string;
  uniqueKey?: string;
}

const BlogsBlock: React.FC<ProductsProps> = ({
  sectionHeading,
  className = "mb-12 lg:mb-14",
  products,
  loading,
  error,
  uniqueKey,
}) => {
  return (
    <div className={className}>
      <SectionHeader sectionHeading={sectionHeading} categorySlug="/blog" />

      {error ? (
        <Alert message={error} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && !products?.length ? (
            <ProductFeedLoader limit={6} uniqueKey={uniqueKey} />
          ) : (
            <BlogsCard list={products} />
          )}
        </div>
      )}
    </div>
  );
};

export default BlogsBlock;
