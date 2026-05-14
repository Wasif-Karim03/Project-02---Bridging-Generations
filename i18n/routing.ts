// Cookie-locale mode for now — no URL prefix. Bengali content + UI strings
// switch via a server-set cookie (NEXT_LOCALE). URL-segment routing
// (/en/..., /bn/...) is a future hardening when SEO becomes critical.

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "bn";
}
