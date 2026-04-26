"use client";

import Image from "@components/ui/next-image";
import Link from "@components/ui/link";
import { useTranslation } from "next-i18next";
import Skeleton from "@components/ui/loaders/skeleton";

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

interface BlogListProps {
  blogs?: {
    data?: Array<any>;
  };
  /** When true, renders a skeleton grid matching the real card layout. */
  isLoading?: boolean;
}

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
  content.length > 220 ? `${content.slice(0, 220).trim()}…` : content;

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const BlogList: React.FC<BlogListProps> = ({ blogs, isLoading = false }) => {
  const { t } = useTranslation("common");
  const items = blogs?.data ?? [];

  // Skeleton card mirrors the real card: 48px-tall image block + date chip
  // + title line + 2 excerpt lines + "Read more" chip.
  const renderSkeletonCard = (i: number) => (
    <div
      key={`blog-skel-${i}`}
      className="flex h-full flex-col overflow-hidden rounded-md bg-white shadow-vendorCard"
    >
      <Skeleton className="h-48 w-full" rounded="none" />
      <div className="flex flex-1 flex-col p-5 md:p-6 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-20 mt-2" />
      </div>
    </div>
  );

  return (
    <div className="border-t border-gray-300 pt-10 lg:pt-12 xl:pt-14 pb-14 lg:pb-16 xl:pb-20">
      <div className="w-full xl:max-w-[1170px] mx-auto">
        <div className="flex items-center justify-between mb-6 xl:mb-8">
          <h2 className="font-bold text-heading text-lg md:text-xl lg:text-2xl xl:text-3xl">
            {t("text-new-blogs")}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))}
          </div>
        ) : !items.length ? (
          <div className="py-16 text-center text-sm text-body">
            {t("text-no-result-found")}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const thumbnail = getThumbnail(item?.thumbnail);
              const plainText = stripHtml(item?.content);
              const excerpt = createExcerpt(plainText);
              const publishedAt = formatDate(item?.updated_at);
              const key = item?.slug || (item?.id ? String(item.id) : `blog-${index}`);

              return (
                <Link
                  key={key}
                  href={`/${item?.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-md bg-white shadow-vendorCard transition-all hover:shadow-vendorCardHover"
                >
                  {thumbnail ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={thumbnail}
                        alt={item?.title ?? "blog thumbnail"}
                        layout="fill"
                        objectFit="cover"
                        className="transition duration-300 ease-in-out group-hover:scale-105"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    {publishedAt ? (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        {publishedAt}
                      </span>
                    ) : null}

                    <h3 className="mt-3 text-lg font-semibold leading-6 text-heading transition-colors duration-200">
                      {item?.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-body flex-1">
                      {excerpt}
                    </p>

                    <span className="mt-4 inline-flex items-center text-sm font-semibold transition duration-200 group-hover:underline">
                      Read More
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
