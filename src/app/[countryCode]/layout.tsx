"use client";

import dynamic from "next/dynamic";
import React from "react";
import ClientOnly from "@components/common/client-only";

// ChawkBazar's SiteLayout + descendants (Search, Scrollbar, Swiper etc.)
// assume a client-only environment (they read `window`/`document` at module
// load). Loading SiteLayout with SSR disabled plus wrapping `children` in
// `ClientOnly` sidesteps those crashes without touching any original JSX.
const SiteLayout = dynamic(() => import("@components/layout/layout"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-16 border-b border-gray-100 md:h-20" />
      <div className="flex-1" />
    </div>
  ),
});

export default function CountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLayout>
      <ClientOnly>{children}</ClientOnly>
    </SiteLayout>
  );
}
