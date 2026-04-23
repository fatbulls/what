import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface BrandCardLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const BrandCardLoader = ({ className }: BrandCardLoaderProps) => (
  <Skeleton className={cn("aspect-square w-full", className)} rounded="lg" />
);

export default BrandCardLoader;
