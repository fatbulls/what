import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface ProductFlashSaleGridLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const ProductFlashSaleGridLoader = ({ className }: ProductFlashSaleGridLoaderProps) => (
  <div className={cn("w-full space-y-3", className)}>
    <Skeleton className="aspect-square w-full" rounded="lg" />
    <Skeleton className="h-3 w-2/3" rounded="sm" />
    <Skeleton className="h-3 w-1/3" rounded="sm" />
    <Skeleton className="h-4 w-full" rounded="lg" />
  </div>
);

export default ProductFlashSaleGridLoader;
