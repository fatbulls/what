import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface ProductCardLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const ProductCardLoader = ({ className }: ProductCardLoaderProps) => (
  <div className={cn("w-full", className)}>
    <Skeleton className="aspect-[334/430] w-full" rounded="lg" />
    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-2/3" rounded="sm" />
      <Skeleton className="h-3 w-3/4" rounded="sm" />
      <Skeleton className="h-3 w-1/3" rounded="sm" />
    </div>
  </div>
);

export default ProductCardLoader;
