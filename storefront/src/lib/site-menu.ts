import "server-only";

// Server-side menu fetch — used by the root layout (via a cached server
// component) so the header + mobile menu reflect whatever the admin has
// configured, without an extra client round-trip.

import { cache } from "react";

const BACKEND =
  process.env.MEDUSA_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://127.0.0.1:9000";
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export type MenuNode = {
  id: string;
  label: string;
  href: string | null;
  children: MenuNode[];
};

async function _loadMenu(key = "header"): Promise<MenuNode[]> {
  try {
    const res = await fetch(
      `${BACKEND}/store/menu?key=${encodeURIComponent(key)}`,
      {
        headers: PK ? { "x-publishable-api-key": PK } : {},
        next: { revalidate: 60, tags: [`menu:${key}`] },
      },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { menu?: MenuNode[] };
    return body.menu ?? [];
  } catch {
    return [];
  }
}

export const loadMenu = cache(_loadMenu);
