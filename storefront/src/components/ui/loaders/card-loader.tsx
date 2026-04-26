import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface CardLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const CardLoader = ({ className }: CardLoaderProps) => (
  <div className={cn("w-full", className)}>
    <Skeleton className="aspect-square w-full" rounded="full" />
    <Skeleton className="mt-4 h-3 w-2/3" rounded="md" />
  </div>
);

export default CardLoader;
