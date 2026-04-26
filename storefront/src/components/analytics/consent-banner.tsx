"use client";

// Minimal Consent Mode v2 banner. Only renders if the user hasn't already
// chosen. Localize via next-i18next later if needed.

import { useEffect, useState } from "react";

const STORAGE_KEY = "consent_v2";

function applyConsent(accept: boolean) {
  if (typeof window === "undefined") return;
  const state = {
    ad_storage: accept ? "granted" : "denied",
    ad_user_data: accept ? "granted" : "denied",
    ad_personalization: accept ? "granted" : "denied",
    analytics_storage: accept ? "granted" : "denied",
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
  const w = window as any;
  if (typeof w.gtag === "function") w.gtag("consent", "update", state);
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;

  const choose = (accept: boolean) => {
    applyConsent(accept);
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-700">
          We use cookies to personalize content, analyze traffic, and improve your experience.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
