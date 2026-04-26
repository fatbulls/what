import Skeleton from "@components/ui/loaders/skeleton";

// Shared skeleton for blog-detail routes. Used both by
// `app/[slug]/loading.tsx` (route-transition Suspense) and by
// `app/[slug]/page-client.tsx` (React Query fetch state), so the visual
// handoff is seamless.
export default function BlogDetailSkeleton() {
  return (
    <article
      data-skeleton="blog-detail"
      className="max-w-3xl mx-auto space-y-4"
    >
      <Skeleton className="aspect-[16/9] w-full" />
      <Skeleton className="h-4 w-40" /> {/* date */}
      <Skeleton className="h-10 w-3/4" /> {/* title */}
      <div className="space-y-2 pt-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-3 ${i % 4 === 3 ? "w-1/2" : "w-full"}`}
          />
        ))}
      </div>
    </article>
  );
}
