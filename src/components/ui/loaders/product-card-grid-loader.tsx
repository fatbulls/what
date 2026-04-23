import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface ProductCardGridLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const ProductCardGridLoader = ({ className }: ProductCardGridLoaderProps) => (
  <div className={cn("w-full", className)}>
    <Skeleton className="aspect-square w-full" rounded="lg" />
    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-2/3" rounded="sm" />
      <Skeleton className="h-3 w-1/2" rounded="sm" />
      <Skeleton className="h-3 w-1/4" rounded="sm" />
    </div>
  </div>
);

export default ProductCardGridLoader;
