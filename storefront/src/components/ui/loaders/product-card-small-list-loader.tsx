import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface ProductCardListSmallLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const ProductCardListSmallLoader = ({ className }: ProductCardListSmallLoaderProps) => (
  <div className={cn("flex w-full items-center gap-4", className)}>
    <Skeleton className="aspect-square w-32 flex-shrink-0" rounded="lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-2/3" rounded="sm" />
      <Skeleton className="h-3 w-1/2" rounded="sm" />
      <Skeleton className="h-3 w-1/3" rounded="sm" />
    </div>
  </div>
);

export default ProductCardListSmallLoader;
