import Container from "@components/ui/container";
import Skeleton from "@components/ui/loaders/skeleton";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";

// Mirrors <CategoryClient>: a full-width CategoryBanner hero (≥270px gray
// block with a centered title) then a product grid inside the Container.
export default function Loading() {
  return (
    <div data-skeleton="category" className="border-t-2 border-borderBottom">
      <Container>
        {/* CategoryBanner placeholder: image block + centered title */}
        <div className="my-4 bg-gray-200 rounded-md relative flex flex-row md:min-h-[270px]">
          <div className="hidden md:block flex-1">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
          <div className="relative md:absolute top-0 ltr:left-0 rtl:right-0 h-auto md:h-full w-full md:w-2/5 flex items-center py-6">
            <div className="w-full px-7 flex flex-col items-center gap-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="pb-16 lg:pb-20">
          <ProductFeedLoader limit={12} />
        </div>
      </Container>
    </div>
  );
}
