"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

const namespaces = [
  "common",
  "forms",
  "menu",
  "footer",
  "faq",
  "aboutUs",
  "privacy",
  "terms",
  "new",
];

let initialized = false;

export function initI18n(locale: string = "en") {
  if (initialized) return i18n;
  initialized = true;

  i18n
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          fetch(`/locales/${language}/${namespace}.json`).then((res) => res.json())
      )
    )
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: "en",
      ns: namespaces,
      defaultNS: "common",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });

  return i18n;
}

export default i18n;
