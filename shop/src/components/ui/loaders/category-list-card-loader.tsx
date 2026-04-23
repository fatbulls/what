import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface CategoryListCardLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const CategoryListCardLoader = ({ className }: CategoryListCardLoaderProps) => (
  <div className={cn("flex items-center rounded-md bg-gray-100 p-4", className)}>
    <Skeleton className="h-14 w-14 flex-shrink-0" rounded="full" />
    <div className="ml-4 flex w-full flex-col space-y-2">
      <Skeleton className="h-3 w-1/2" rounded="sm" />
      <Skeleton className="h-3 w-12" rounded="sm" />
    </div>
    <Skeleton className="ml-auto h-6 w-6" rounded="md" />
  </div>
);

export default CategoryListCardLoader;
