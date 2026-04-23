import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface CardIconLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const CardIconLoader = ({ className }: CardIconLoaderProps) => (
  <Skeleton className={cn("aspect-square w-full", className)} rounded="lg" />
);

export default CardIconLoader;
