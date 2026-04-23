"use client";

import dynamic from "next/dynamic";
import ClientOnly from "@components/common/client-only";

// Client-only shell. Importing SiteLayout from a Server Component marks the
// whole transitive chain as server-rendered, which fails because ChawkBazar
// components use `next/router` and other client-only APIs. Isolating the
// dynamic import inside a "use client" module keeps SSR off the ChawkBazar
// tree while still allowing the root layout to stay a Server Component and
// export `metadata` / SEO.
const SiteLayout = dynamic(() => import("@components/layout/layout"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-16 border-b border-gray-100 md:h-20" />
      <div className="flex-1" />
    </div>
  ),
});

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SiteLayout>
      <ClientOnly>{children}</ClientOnly>
    </SiteLayout>
  );
}
