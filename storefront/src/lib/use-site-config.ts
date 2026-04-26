"use client";

// Client-side mirror of server-only `site-config.ts`. Fetches the public
// `/store/site-config` keys once and caches them in a module-level promise
// so multiple consumers in the same browser share one network call. The
// server component equivalent (`src/lib/site-config.ts`) is used in RSC
// pages; this hook is for client components (e.g. address-grid, checkout
// blocks) that need the same admin-editable settings.

import { useEffect, useState } from "react";
import { sdk } from "@lib/medusa";

export type SiteConfig = Record<string, string | null>;

let _cache: SiteConfig | null = null;
let _inflight: Promise<SiteConfig> | null = null;

async function fetchSiteConfig(): Promise<SiteConfig> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  _inflight = (async () => {
    try {
      const res = await sdk.client.fetch<{ config?: SiteConfig }>(
        "/store/site-config"
      );
      _cache = res.config ?? {};
      return _cache;
    } catch {
      _cache = {};
      return _cache;
    } finally {
      _inflight = null;
    }
  })();
  return _inflight;
}

export function useSiteConfig(): SiteConfig {
  const [cfg, setCfg] = useState<SiteConfig>(_cache ?? {});
  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    fetchSiteConfig().then((c) => !cancelled && setCfg(c));
    return () => {
      cancelled = true;
    };
  }, []);
  return cfg;
}

export function getConfigValue(
  cfg: SiteConfig,
  key: string,
  fallback = ""
): string {
  const v = cfg[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
