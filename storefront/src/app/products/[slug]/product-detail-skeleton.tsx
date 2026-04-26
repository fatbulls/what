import Skeleton from "@components/ui/loaders/skeleton";

// Matches the live product detail page layout: image gallery on the left,
// title/price/variant/ATC block on the right. Visual continuity with the
// real page so the swap feels instant.
export default function ProductDetailSkeleton() {
  return (
    <div
      data-skeleton="product-detail"
      className="grid gap-6 lg:gap-10 lg:grid-cols-2"
    >
      {/* Gallery */}
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" /> {/* breadcrumb */}
        <Skeleton className="h-8 w-3/4" /> {/* title */}
        <Skeleton className="h-6 w-32" /> {/* price */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        {/* Variant pickers */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20" />
            ))}
          </div>
        </div>
        {/* Quantity + ATC */}
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 flex-1" />
        </div>
        <div className="pt-4 space-y-2 border-t border-gray-100">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
