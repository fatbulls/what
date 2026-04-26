import Skeleton from "@components/ui/loaders/skeleton";

// Shared skeleton for the order confirmation / order detail routes.
// Matches OrderView's rough layout: thank-you header, status + back link,
// 4-card metadata grid, 2-column totals + details block, and a line-items
// table.
export default function OrderViewSkeleton() {
  return (
    <div
      data-skeleton="order-view"
      className="max-w-[1280px] mx-auto mb-14 lg:mb-16"
    >
      {/* Thank-you header */}
      <div className="mb-8 text-center space-y-3">
        <Skeleton className="h-8 w-80 mx-auto" />
        <Skeleton className="h-4 w-[32rem] max-w-full mx-auto" />
      </div>

      {/* Status row + back link */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-24" rounded="sm" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* 4-card meta grid */}
      <div className="grid gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-11">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 md:p-6 border border-gray-100 bg-gray-200 rounded-md shadow-sm space-y-2"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* 2-col totals + details */}
      <div className="flex flex-col md:flex-row border border-gray-100 rounded-md mb-10">
        <div className="w-full md:w-1/2 border-r px-5 lg:px-7 py-6 lg:py-7 xl:py-8 border-gray-100 space-y-4">
          <Skeleton className="h-7 w-48" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <div className="w-full md:w-1/2 px-5 lg:px-7 py-6 lg:py-7 xl:py-8 space-y-4">
          <Skeleton className="h-7 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div className="border border-gray-100 rounded-md divide-y divide-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-16 w-16 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
