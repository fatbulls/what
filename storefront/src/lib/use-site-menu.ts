"use client";

// Client-side mirror of server-only `site-menu.ts`. Used by Header and
// MobileMenu — both are inside the `dynamic(ssr:false)` Shell so they
// hydrate client-side anyway. One module-level fetch per session is
// shared across consumers.

import { useEffect, useState } from "react";
import { sdk } from "@lib/medusa";

export type MenuNode = {
  id: string;
  label: string;
  href: string | null;
  children: MenuNode[];
};

const cache = new Map<string, MenuNode[]>();
const inflight = new Map<string, Promise<MenuNode[]>>();

async function fetchMenu(key: string): Promise<MenuNode[]> {
  if (cache.has(key)) return cache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;
  const p = (async () => {
    try {
      const res = await sdk.client.fetch<{ menu: MenuNode[] }>(
        "/store/menu",
        { query: { key } },
      );
      const menu = res.menu ?? [];
      cache.set(key, menu);
      return menu;
    } catch {
      cache.set(key, []);
      return [];
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

// Adapt the DB shape (`{id, label, href, children}`) to the legacy
// ChawkBazar shape (`{id, path, label, subMenu}`) that Header / MobileMenu
// components expect. Keeps the call sites unchanged.
export function adaptToLegacy(nodes: MenuNode[]): any[] {
  return nodes.map((n) => ({
    id: n.id,
    path: n.href ?? "#",
    label: n.label,
    subMenu:
      n.children && n.children.length
        ? adaptToLegacy(n.children)
        : undefined,
  }));
}

export function useSiteMenu(
  key = "header",
  fallback: MenuNode[] = [],
): MenuNode[] {
  const [nodes, setNodes] = useState<MenuNode[]>(
    cache.get(key) ?? fallback,
  );
  useEffect(() => {
    let cancelled = false;
    fetchMenu(key).then((m) => {
      if (!cancelled && m.length) setNodes(m);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return nodes;
}
