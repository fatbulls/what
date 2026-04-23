import { Attribute } from "@framework/types";
import { CoreApi } from "@framework/utils/core-api";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import { useQuery } from "react-query";

const BlogService = new CoreApi(API_ENDPOINTS.BLOG);

export const fetchBlogs = async () => {
  const { data } = await BlogService.findAll();
  return { blogs: data as Attribute[] };
};

export const useBlogsQuery = () => {
  return useQuery<{ blogs: Attribute[] }, Error>(
    API_ENDPOINTS.BLOG,
    fetchBlogs
  );
};

export const fetchBlogsBanner = async () => {
  const { data } = await BlogService.find({
    limit: 3,
    orderBy: "updated_at",
  });
  return { blogs: data as Attribute[] };
};

export const useBlogsBannerQuery = () => {
  return useQuery<{ blogs: Attribute[] }, Error>(
    API_ENDPOINTS.BLOG,
    fetchBlogsBanner
  );
};

export const fetchBlog = async (id: string | number) => {
  const { data } = await BlogService.findOne(id);
  return { blog: data as Attribute };
};

export const useBlogQuery = (id: string | number) => {
  return useQuery<{ blog: Attribute }, Error>(
    [API_ENDPOINTS.BLOG, id],
    () => fetchBlog(id)
  );
};
