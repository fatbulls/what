"use client";

import { useEffect, useState } from "react";

/**
 * ChawkBazar components frequently read `document` / `window` at module load
 * time (e.g. `overlayscrollbars`, various swipers). In App Router every page
 * module is evaluated during SSR regardless of the "use client" directive on
 * the component itself, which triggers those access crashes. Wrapping the
 * tree in `<ClientOnly>` defers the initial render until after hydration, so
 * the client-only dependencies never run on the server.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
