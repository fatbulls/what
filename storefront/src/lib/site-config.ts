import "server-only";

// Server-side helper: fetch tenant site-config from Medusa, cached per route
// segment via the RSC `cache()` wrapper so every consumer in a render pass
// shares one fetch. ISR (revalidate=60 on each page) guarantees refresh.

import { cache } from "react";

// Server-to-server fetch: prefer the internal URL so we don't bounce through
// Cloudflare's edge cache. Falls back to the public URL if unset (e.g. in
// preview environments where the Medusa backend is remote).
const BACKEND =
  process.env.MEDUSA_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://127.0.0.1:9000";
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export type SiteConfig = Record<string, string | null>;

async function _loadSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${BACKEND}/store/site-config`, {
      headers: PK ? { "x-publishable-api-key": PK } : {},
      // Short TTL so admin edits reflect within a few seconds of save.
      // The `site-config` tag lets admin POST calls call revalidateTag()
      // for instant invalidation on save.
      next: { revalidate: 5, tags: ["site-config"] },
    });
    if (!res.ok) return {};
    const body = (await res.json()) as { config?: SiteConfig };
    return body.config ?? {};
  } catch {
    return {};
  }
}

export const loadSiteConfig = cache(_loadSiteConfig);

export function getConfigValue(
  cfg: SiteConfig,
  key: string,
  fallback = ""
): string {
  const v = cfg[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
