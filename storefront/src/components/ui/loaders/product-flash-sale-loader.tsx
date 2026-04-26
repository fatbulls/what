import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface ProductFlashSaleLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const ProductFlashSaleLoader = ({ className }: ProductFlashSaleLoaderProps) => (
  <div className={cn("flex flex-col space-y-4", className)}>
    <div className="flex gap-4">
      <Skeleton className="aspect-square w-52" rounded="lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-3 w-2/3" rounded="sm" />
        <Skeleton className="h-3 w-1/2" rounded="sm" />
        <Skeleton className="h-3 w-1/3" rounded="sm" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" rounded="lg" />
  </div>
);

export default ProductFlashSaleLoader;
