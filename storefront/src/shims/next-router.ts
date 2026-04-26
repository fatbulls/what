"use client";

// Compat shim — ChawkBazar components import `useRouter` from `next/router`
// (Pages Router). We redirect the import via webpack alias + tsconfig paths to
// this file. We expose a Router object with the subset of the API that the
// components actually use (`push`, `replace`, `back`, `asPath`, `pathname`,
// `query`, `locale`, `isReady`, `events.on/off`).

import { useMemo } from "react";
import {
  useRouter as useAppRouter,
  usePathname,
  useSearchParams,
  useParams,
} from "next/navigation";

const noopEvents = {
  on: (_event: string, _cb: (...args: any[]) => void) => {},
  off: (_event: string, _cb: (...args: any[]) => void) => {},
  emit: (_event: string, ..._args: any[]) => {},
};

type PushArg =
  | string
  | {
      pathname?: string;
      query?: Record<string, string | string[] | undefined>;
      hash?: string;
    };

function buildUrl(arg: PushArg): string {
  if (typeof arg === "string") return arg;
  const { pathname = "/", query, hash } = arg;
  const qs = query
    ? Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .flatMap(([k, v]) =>
          Array.isArray(v)
            ? v.map((item) => [k, String(item)] as [string, string])
            : [[k, String(v)] as [string, string]]
        )
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    : "";
  return `${pathname}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

function toQuery(sp: URLSearchParams): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  sp.forEach((value, key) => {
    const existing = out[key];
    if (existing === undefined) {
      out[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      out[key] = [existing, value];
    }
  });
  return out;
}

export interface CompatRouter {
  push(href: PushArg, as?: string, opts?: any): Promise<boolean> | void;
  replace(href: PushArg, as?: string, opts?: any): Promise<boolean> | void;
  back(): void;
  reload(): void;
  prefetch(href: string): Promise<void>;
  asPath: string;
  pathname: string;
  route: string;
  query: Record<string, string | string[]>;
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
  isReady: boolean;
  isFallback: boolean;
  events: typeof noopEvents;
}

export function useRouter(): CompatRouter {
  const router = useAppRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const params = useParams();

  const searchString = searchParams?.toString() ?? "";

  return useMemo<CompatRouter>(() => {
    // ChawkBazar's `router.locale` used to be an i18n language like "en"/"zh"
    // set by next-i18next. Our URL `countryCode` ("dk"/"us") is a Medusa
    // region code, not a language — returning it would make components like
    // LanguageSwitcher crash looking up `options.find(o.value === "dk")`.
    // Locale changes now go through i18next (`useTranslation().i18n`), so we
    // return "en" here as a safe default.
    const locale = "en";

    const queryFromParams: Record<string, string | string[]> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (typeof v === "string") queryFromParams[k] = v;
        else if (Array.isArray(v)) queryFromParams[k] = v;
      }
    }

    const query: Record<string, string | string[]> = {
      ...queryFromParams,
      ...toQuery(new URLSearchParams(searchString)),
    };

    const asPath = pathname + (searchString ? `?${searchString}` : "");

    return {
      push: (href, _as, _opts) => {
        router.push(buildUrl(href));
      },
      replace: (href, _as, _opts) => {
        router.replace(buildUrl(href));
      },
      back: () => router.back(),
      reload: () => router.refresh(),
      prefetch: async (href: string) => {
        router.prefetch(href);
      },
      asPath,
      pathname,
      route: pathname,
      query,
      locale,
      locales: undefined,
      defaultLocale: "en",
      isReady: true,
      isFallback: false,
      events: noopEvents,
    };
  }, [pathname, searchString, params, router]);
}

// Re-export a default router-like object for the rare case of
// `import Router from 'next/router'` (not hook-based). We return a stub that
// mostly throws so we spot unsupported usage.
const Router = {
  push: (_: PushArg) => {
    console.warn(
      "Static Router import not supported in App Router shim; use useRouter()"
    );
  },
  replace: (_: PushArg) => {
    console.warn(
      "Static Router.replace not supported in App Router shim; use useRouter()"
    );
  },
  events: noopEvents,
};
export default Router;

export function withRouter<T>(Component: T): T {
  return Component;
}
