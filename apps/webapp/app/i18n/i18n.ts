import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";
import type { AppLanguage } from "./types";

/**
 * Creates an isolated instance. Calling createInstance per request prevents a
 * Spanish request from mutating an English SSR render under concurrent load.
 */
export function createI18n(language: AppLanguage) {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    defaultNS: "common",
    ns: [
      "common",
      "auth",
      "sidebar",
      "navigation",
      "command",
      "pagination",
      "a11y",
      "image",
      "inventory",
      "scanner",
      "booking",
      "audit",
      "welcome",
      "reports",
      "settings",
      "format",
    ],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false,
  });
  return instance;
}
