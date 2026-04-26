"use client";

import React from "react";
import { siteSettings } from "@settings/site.settings";

type State = typeof initialState;

const initialState = {
  siteTitle: siteSettings.name,
  siteSubtitle: siteSettings.description,
  currency: siteSettings.currency,
  // Admin-editable customer-support WhatsApp link, server-fed in
  // layout.tsx from site_config.social_whatsapp. Empty string => the
  // footer link falls back to a /contact-us route instead of an
  // unreachable WhatsApp URL.
  whatsappUrl: "",
  logo: {
    id: 1,
    thumbnail: siteSettings.logo.url,
    original: siteSettings.logo.url,
  },
  // Default delivery schedules for checkout ScheduleGrid — the original
  // Laravel backend returned these from `settings.options.deliveryTime`.
  // Kept as a static list so the checkout flow doesn't crash in the Medusa
  // port where settings come from `core-api.ts`'s static stub.
  deliveryTime: [
    {
      id: 1,
      title: "Same Day Delivery",
      description: "Order before 2PM for same-day delivery.",
    },
    {
      id: 2,
      title: "Standard Delivery",
      description: "Delivered within 2–3 business days.",
    },
    {
      id: 3,
      title: "Scheduled Delivery",
      description: "Pick a specific date that works for you.",
    },
  ],
  seo: {
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: {
      id: 1,
      thumbnail: "",
      original: "",
    },
    twitterHandle: "",
    twitterCardType: "",
    metaTags: "",
    canonicalUrl: "",
  },
  google: {
    isEnable: false,
    tagManagerId: "",
  },
  facebook: {
    isEnable: false,
    appId: "",
    pageId: "",
  },
};

export const SettingsContext = React.createContext<State | any>(initialState);

SettingsContext.displayName = "SettingsContext";

export const SettingsProvider: React.FC<{ initialValue: any }> = ({
                                                                    initialValue,
                                                                    ...props
                                                                  }) => {
  // Shallow-merge so server-supplied overrides (e.g. admin-uploaded
  // logo) replace the matching default keys without wiping unrelated
  // sections like `deliveryTime` or `seo`.
  const [state] = React.useState(() => {
    if (!initialValue) return initialState;
    return {
      ...initialState,
      ...initialValue,
      logo: { ...initialState.logo, ...(initialValue.logo ?? {}) },
    };
  });
  return <SettingsContext.Provider value={state} {...props} />;
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(`useSettings must be used within a SettingsProvider`);
  }
  return context;
};
