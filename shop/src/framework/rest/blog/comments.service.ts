import { CoreApi } from "@framework/utils/core-api";
import { API_ENDPOINTS } from "@framework/utils/endpoints";

export type CommentsType = {
  id: string;
  [key: string]: unknown;
};
export type ContactType = {
  name: string;
  email: string;
  subject: string;
  description: string;
};

class Comments extends CoreApi {
  constructor(_base_path: string) {
    super(_base_path);
  }

  postComments(input: CommentsType) {ƒ
    return this.http.post(this._base_path, input);
  }

  async getCommentsList(id: string) {
    return await this.fetchUrl(this._base_path+'?search=blog_id:'+id+'&page=1&limit=20&orderBy=updated_at&sortedBy=ASC')
  }
  //   updateCustomer(input: CustomerType) {
  //     return this.http
  //       .put(this._base_path + '/' + input.id, input)
  //       .then((res) => res.data);
  //   }
  contact(input: CommentsType) {
    return this.http
      .post(API_ENDPOINTS.COMMENTS, input)
      .then((res) => res.data);
  }
  //   deleteAddress({ id }: { id: string }) {
  //     return this.http
  //       .delete(`${API_ENDPOINTS.ADDRESS}/${id}`)
  //       .then((res) => res.data);
  //   }
}

export const CommentsService = new Comments(API_ENDPOINTS.COMMENTS);
