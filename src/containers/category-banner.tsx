import Image from "@components/ui/next-image";
import type { Category } from "@framework/types";
import { categoryBannerPlaceholder } from "@lib/placeholders";

interface CategoryBannerProps {
  className?: string;
  category?: Category | null;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({
  className = "mb-7",
  category,
}) => {
  const bannerImage = category?.banner_image?.original ?? categoryBannerPlaceholder;
  const title = category?.name ?? "Category";

  return (
    <div
      className={`bg-gray-200 rounded-md relative flex flex-row md:min-h-[270px] ${className}`}
    >
      <div className="hidden md:flex flex-1">
        <Image
          src={bannerImage}
          alt="Category Banner"
          width={1800}
          height={270}
          className="rounded-md object-cover"
        />
      </div>
      <div className="relative md:absolute top-0 ltr:left-0 rtl:right-0 h-auto md:h-full w-full md:w-2/5 flex items-center py-2 sm:py-3.5">
        <h1 className="capitalize text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-heading p-7 text-center w-full">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default CategoryBanner;
