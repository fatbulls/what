"use client";

import dynamic from "next/dynamic";
import type React from "react";

// ChawkBazar's SiteLayout + full widget tree relies on jotai, next-i18next,
// swiper, overlayscrollbars, next/router (shimmed) and other browser APIs.
// Rendering the whole tree on the server takes >2min in dev and defeats
// time-to-first-byte, so we bail the chrome to CSR. Crawler-relevant
// signals (Store JSON-LD, <title>, OG tags, sr-only brand copy) live in
// app/layout.tsx and app/*/page.tsx and ship in raw HTML.
const SiteLayout = dynamic(() => import("@components/layout/layout"), {
  ssr: false,
});

export default function Shell({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
