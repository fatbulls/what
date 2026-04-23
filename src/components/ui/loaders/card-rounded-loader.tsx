import cn from "classnames";
import Skeleton from "@components/ui/loaders/skeleton";

interface CardRoundedLoaderProps {
  className?: string;
  uniqueKey?: string;
}

const CardRoundedLoader = ({ className }: CardRoundedLoaderProps) => (
  <div className={cn("w-full", className)}>
    <Skeleton className="aspect-[197/197] w-full" rounded="lg" />
    <Skeleton className="mt-4 h-3 w-3/4" rounded="md" />
  </div>
);

export default CardRoundedLoader;
