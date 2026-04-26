"use client";

import { useState } from "react";
import TextArea from "@components/ui/text-area";
import Button from "@components/ui/button";
import Input from "@components/ui/input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import {
  useCommentsPost,
  useCommentsList,
} from "@framework/blog/comments.query";
import { useTranslation } from "next-i18next";
import Image from "@components/ui/next-image";

// "blog_id": 1,
//     "comment": "comment detail",
//     "guest_name": "jack",
//     "guest_email": "jackyang@baidu.com"
type FormValues = {
  guest_name: string;
  guest_email: string;
  comment: string;
  blog_id: string;
  website: string;
};

const M = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const BlogComments: React.FC = ({ id, title }) => {
  const [count, setCount] = useState(0);
  const [tempData, setTempData] = useState(null);
  const router = useRouter();
  const { t } = useTranslation("forms");

  const { data } = useCommentsList(router.query.id);

  data?.comments?.data.forEach((item) => {
    if (item.approved !== 0) setCount(count + 1);
    const t = new Date(item.created_at);
    const fY = t.getFullYear();
    const m = t.getMonth();
    const d = t.getDate();
    item.timeStr = `${M[m]} ${d}, ${fY}`;
  });

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      guest_name: "",
      guest_email: "",
      comment: "",
      blog_id: router.query.id,
      website: "",
      parent_id: undefined,
    },
  });

  const onSubmit = (values) => {
    if (tempData) values.parent_id = tempData.id;
    useCommentsPost(values).then(() => {
      window && window.scrollTo(0, 0);
    });
  };

  const handleClickReply = (item) => {
    setTempData({
      id: item.id,
      name: item.guest_name,
    });
  };

  const handleClickCancel = () => {
    setTempData(null);
  };
  return (
    <div className="comments-area" id="comments">
      <h2 className="comments-title">
        {count} Comments on "{title}"
      </h2>

      <ol className="comment-list">
        {data?.comments?.data.map((item) => {
          return (
            <li
              className="comment even thread-even depth-1 post-comment"
              key={item.id}
            >
              <div className="comment-card">
                <div className="comment-avatar">
                  <Image
                    src="/assets/images/blog/profile.png"
                    className="avatar avatar-60 photo"
                    width={60}
                    height={60}
                    loading="lazy"
                    alt={item.guest_name || "profile avatar"}
                  />
                </div>
                <div className="comment-content">
                  <div className="name">
                    <h4>
                      <span className="fn">{item.guest_name}</span>{" "}
                      <span className="screen-reader-text says">
                        {t("says")}:
                      </span>{" "}
                    </h4>
                  </div>

                  <div className="content">
                    {item.approved === 0 ? (
                      <em>{t("awaiting-moderation")}</em>
                    ) : null}
                    <br />
                    <p>{item.comment}</p>
                  </div>

                  <div className="action">
                    <div className="date">{item.timeStr}</div>
                    <a onClick={() => handleClickReply(item)} className="cs-p">
                      {t("label-reply")}
                      <i className="icon ion-ios-arrow-round-forward"></i>
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="comment-respond">
        <h3 className="comment-reply-title">
          {tempData ? t("leave-to-reply") + tempData.name : t("leave-a-reply")}
        </h3>
        {tempData ? (
          <span className="cancel-reply cs-p" onClick={handleClickCancel}>
            {t("label-cancel-reply")}
          </span>
        ) : null}
      </div>

      <form id="commentform" onSubmit={handleSubmit(onSubmit)}>
        <p className="comment-notes">
          <span id="email-notes">
            {t("blog-email-tips")} <span className="required">*</span>
          </span>
        </p>
        <p className="comment-form-comment">
          <TextArea
            labelKey={t("label-comment")}
            rows={8}
            {...register("comment")}
          />
        </p>

        <p className="comment-form-author">
          <Input labelKey={t("label-name")} {...register("guest_name")} />

          <Input labelKey={t("label-email")} {...register("guest_email")} />

          <Input labelKey={t("label-website")} {...register("website")} />
        </p>

        <p className="comment-form-cookies-consent"></p>
        <p className="form-submit">
          <Button>{t("label-post-comment")}</Button>
        </p>
      </form>
    </div>
  );
};

export default BlogComments;
