import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface CategoryCardLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const CategoryCardLoader = ({ className }: CategoryCardLoaderProps) => (
  <div className={cn("flex flex-col rounded-lg border border-gray-100 p-6", className)}>
    <Skeleton className="h-4 w-1/3" rounded="sm" />
    <div className="mt-5 grid grid-cols-3 gap-3">
      <Skeleton className="aspect-square w-full" rounded="lg" />
      <Skeleton className="aspect-square w-full" rounded="lg" />
      <Skeleton className="aspect-square w-full" rounded="lg" />
    </div>
  </div>
);

export default CategoryCardLoader;
