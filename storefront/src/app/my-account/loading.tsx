import Container from "@components/ui/container";
import Skeleton from "@components/ui/loaders/skeleton";

// Mirrors <AccountLayout>: full-width PageHeader bar + Container with
// 6-item left nav + content pane. The 6 nav items correspond to the real
// accountMenu (Dashboard / Orders / Addresses / Contact / Email / Password).
export default function Loading() {
  return (
    <div data-skeleton="my-account">
      {/* PageHeader */}
      <div className="bg-gray-200 py-6 md:py-8 lg:py-10 mb-6">
        <Container>
          <Skeleton className="h-8 w-64" />
        </Container>
      </div>
      <Container>
        <div className="py-10 lg:py-14 flex flex-col lg:flex-row w-full">
          {/* Mobile top-nav placeholder */}
          <div className="lg:hidden mb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          {/* Sidebar nav — 6 items */}
          <aside className="hidden lg:block flex-shrink-0 md:w-2/6 2xl:w-4/12 ltr:md:pr-8 ltr:lg:pr-12 ltr:xl:pr-16 ltr:2xl:pr-20">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 px-4 border-b border-gray-100"
                >
                  <Skeleton className="h-5 w-5 rounded" rounded="sm" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </aside>
          {/* Content */}
          <div className="flex-1 space-y-5">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <div className="grid gap-4 sm:grid-cols-2 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
