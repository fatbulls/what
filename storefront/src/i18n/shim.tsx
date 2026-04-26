"use client";

// `next-i18next` shim — ChawkBazar components import `useTranslation` / `Trans`
// from `next-i18next`. In App Router we can't use `appWithTranslation`, so we
// redirect the import via webpack alias to this file, which re-exports the
// `react-i18next` equivalents. `react-i18next` shares the same signature, so
// components work unchanged as long as an `I18nextProvider` is mounted above
// them (see `Providers`).

export { useTranslation, Trans, withTranslation } from "react-i18next";

// Pages Router helper — not available in App Router. Return empty so callers
// of `getStaticProps` that spread the result still work.
export async function serverSideTranslations(
  _locale: string,
  _namespaces?: string[]
): Promise<Record<string, unknown>> {
  return {};
}

// HOC used in _app.tsx. In App Router we wrap via Providers, so this is a noop.
export function appWithTranslation<T>(Component: T): T {
  return Component;
}
