import BlogsBlock from "./blog-banner-block";
import isEmpty from "lodash/isEmpty";
import NotFoundItem from "@components/404/not-found-item";
import { useBlogsBannerQuery } from "@framework/blog/blog.query";

export default function BlogsBanner() {
  const { data, isLoading: loading, error }: any = useBlogsBannerQuery();

  if (!loading && isEmpty(data?.blogs)) {
    return <NotFoundItem text="Sorry, No Blogs Found" />;
  }

  return (
    <BlogsBlock
      sectionHeading="text-new-blogs"
      products={data?.blogs?.data}
      loading={loading}
      error={error?.message}
      uniqueKey="blogs-banner"
    />
  );
}
