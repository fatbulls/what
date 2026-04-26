import Container from "@components/ui/container";
import Skeleton from "@components/ui/loaders/skeleton";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";

// Mirrors <SearchClient>: breadcrumb + left filter sidebar + product grid.
export default function Loading() {
  return (
    <div data-skeleton="search" className="border-t-2 border-borderBottom">
      <Container>
        <div className="flex items-center gap-2 py-4 lg:py-6">
          <Skeleton className="h-3 w-12" />
          <span className="text-body">/</span>
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex gap-8 xl:gap-12 pb-16 lg:pb-20">
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 space-y-6 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 pb-4 border-b border-gray-100">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-3/4" />
                  ))}
                </div>
              </div>
            ))}
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-40" />
            </div>
            <ProductFeedLoader limit={12} />
          </div>
        </div>
      </Container>
    </div>
  );
}
