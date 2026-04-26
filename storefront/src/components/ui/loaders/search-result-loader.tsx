import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface SearchResultLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const SearchResultLoader = ({ className }: SearchResultLoaderProps) => (
  <div className={cn("flex items-center gap-4", className)}>
    <Skeleton className="h-20 w-20 flex-shrink-0" rounded="lg" />
    <div className="w-full space-y-2">
      <Skeleton className="h-3 w-1/3" rounded="sm" />
      <Skeleton className="h-3 w-1/4" rounded="sm" />
    </div>
  </div>
);

export default SearchResultLoader;
