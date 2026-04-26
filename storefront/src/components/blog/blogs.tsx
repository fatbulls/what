"use client";

import Image from "@components/ui/next-image";
import Link from "@components/ui/link";
import type { FC } from "react";
import { useEffect, useState } from "react";

const MONTH_LABELS = [
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

const isJson = (value?: string) => {
  if (typeof value !== "string") return false;
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};

const getThumbnail = (thumbnail?: string) => {
  if (!thumbnail) return undefined;
  if (isJson(thumbnail)) {
    try {
      const parsed = JSON.parse(thumbnail);
      return parsed?.original ?? parsed?.thumbnail ?? undefined;
    } catch (error) {
      return undefined;
    }
  }
  return thumbnail;
};

const stripHtml = (value?: string) =>
  value?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ")?.replace(/\s+/g, " ")?.trim() ?? "";

const createExcerpt = (content: string) =>
  content.length > 140 ? `${content.slice(0, 140).trim()}…` : content;

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

interface BlogsCardProps {
  list?: any[];
}

const BlogsCard: FC<BlogsCardProps> = ({ list = [] }) => {
  return (
    <>
      {list.map((item) => (
        <BlogCardItem key={item?.id ?? item?.slug} item={item} />
      ))}
    </>
  );
};

export default BlogsCard;

const BlogCardItem: FC<{ item: any }> = ({ item }) => {
  const thumbnail = getThumbnail(item?.thumbnail);
  const plainText = stripHtml(item?.content);
  const excerpt = createExcerpt(plainText);
  const publishedAt = formatDate(item?.updated_at ?? item?.created_at);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [item?.id, item?.slug, thumbnail]);

  return (
    <Link
      href={`/${item?.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-vendorCard transition-all hover:-translate-y-1 hover:shadow-vendorCardHover"
    >
      <div
        className={`relative w-full overflow-hidden rounded-t-lg bg-gray-200 ${
          isLoaded ? "" : "animate-pulse"
        }`}
        style={{ aspectRatio: "3 / 2" }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={item?.title ?? "Blog thumbnail"}
            layout="fill"
            objectFit="cover"
            className="bg-gray-200 transition duration-300 ease-in-out group-hover:scale-105"
            onLoadingComplete={() => setIsLoaded(true)}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          {publishedAt}
        </span>
        <h3 className="mt-2 text-base font-semibold leading-6 text-heading transition-colors duration-200">
          {item?.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-body">
          {excerpt}
        </p>
        <span className="mt-4 inline-flex items-center text-sm font-semibold transition duration-200 group-hover:underline">
          Read More
        </span>
      </div>
    </Link>
  );
};
