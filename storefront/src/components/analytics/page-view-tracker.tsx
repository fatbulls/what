"use client";

// Fires a GA4 `page_view` on App Router soft-nav. GA4 auto page_view should
// be disabled in the GTM config tag so there's no double-counting.
// Guarded by a ref keyed on path+search so StrictMode dev double-render and
// Suspense re-mounts don't double-fire.

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    const qs = search?.toString() ?? "";
    const key = qs ? `${pathname}?${qs}` : pathname ?? "";
    if (!key || key === lastRef.current) return;
    lastRef.current = key;
    trackPageView(key);
  }, [pathname, search]);

  return null;
}
