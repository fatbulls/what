import { Attribute } from "@framework/types";
import { CoreApi } from "@framework/utils/core-api";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import { useQuery } from "@/shims/rq-compat";

const CommentsService = new CoreApi(API_ENDPOINTS.COMMENTS);

export const useCommentsPost = async (values) => {
  const { data } = await CommentsService.create(values);
  return { comment: data as Attribute[] };
};

export const fetchBlog = async (id) => {
  const { data } = await CommentsService.fetchUrl(
    API_ENDPOINTS.COMMENTS +
      "?search=blog_id:" +
      id +
      "&page=1&limit=20&orderBy=updated_at&sortedBy=ASC"
  );
  return { comments: data as Attribute[] };
};
export const useCommentsList = (id) => {
  return useQuery<{ comments: Attribute[] }, Error>(
    [API_ENDPOINTS.COMMENTS, id],
    () => fetchBlog(id)
  );
};
