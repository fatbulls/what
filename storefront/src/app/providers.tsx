"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { ManagedUIContext } from "@contexts/ui.context";
import { SettingsProvider } from "@contexts/settings.context";
import dynamic from "next/dynamic";
import i18n, { initI18n } from "@/i18n/i18n-client";
import { QueryBusyBridge } from "@components/common/route-progress";

import "react-toastify/dist/ReactToastify.css";

const ToastContainer = dynamic(
  () =>
    import("react-toastify").then((mod) => ({
      default: mod.ToastContainer,
    })),
  { ssr: false }
);

const ManagedModal = dynamic(
  () => import("@components/common/modal/managed-modal"),
  { ssr: false, loading: () => null }
);

const ManagedDrawer = dynamic(
  () => import("@components/common/drawer/managed-drawer"),
  { ssr: false, loading: () => null }
);

interface Props {
  children: React.ReactNode;
  locale?: string;
  dehydratedState?: unknown;
  // Server-loaded site-config overrides forwarded to SettingsProvider.
  // Currently used for the admin-uploaded logo so <Logo> picks it up
  // sitewide without each consumer re-fetching.
  settingsOverrides?: { logo?: { original: string; thumbnail: string; width?: number; height?: number } } | null;
}

export default function Providers({
  children,
  locale = "en",
  dehydratedState,
  settingsOverrides,
}: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    initI18n(locale);
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <QueryBusyBridge />
        <HydrationBoundary state={dehydratedState as any}>
          <SettingsProvider initialValue={settingsOverrides as any}>
            <ManagedUIContext>
              {children}
              <ToastContainer autoClose={2000} />
              <ManagedModal />
              <ManagedDrawer />
            </ManagedUIContext>
          </SettingsProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
