import "server-only";

// Server helper for fetching a CMS page by slug. Used by /privacy,
// /terms and any other slug-addressed static page wired later. Prefers
// the internal Medusa URL so CF edge caching can't stale the content.

import { cache } from "react";

const BACKEND =
  process.env.MEDUSA_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://127.0.0.1:9000";
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  is_published: boolean;
};

async function _loadPage(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${BACKEND}/store/pages/${slug}`, {
      headers: PK ? { "x-publishable-api-key": PK } : {},
      // Admin edits should land on the storefront within ~60s without a
      // redeploy. Tagged so a future admin-side subscriber can revalidate.
      next: { revalidate: 60, tags: [`page:${slug}`] },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { page?: CmsPage };
    return body.page ?? null;
  } catch {
    return null;
  }
}

export const loadPage = cache(_loadPage);
