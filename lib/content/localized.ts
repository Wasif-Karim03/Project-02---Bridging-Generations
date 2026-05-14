import { getLocale } from "next-intl/server";

/**
 * Pick the locale-appropriate value from an English/Bengali pair.
 *
 * Falls back to English when:
 *   - active locale is "en"
 *   - active locale is "bn" but the Bengali value is empty/whitespace
 *
 * Pure function — callers pass in the resolved locale to avoid an async
 * await per call when rendering lists.
 */
export function pickLocalized(
  locale: string,
  en: string | null | undefined,
  bn: string | null | undefined,
): string {
  if (locale === "bn") {
    const trimmed = bn?.trim();
    if (trimmed) return bn ?? "";
  }
  return en ?? "";
}

/**
 * Server-side convenience that resolves the current locale before picking.
 * Use in pages/components that only need one or two localized fields.
 * For lists, prefer `getLocale()` once and pass the locale into `pickLocalized`.
 */
export async function getLocalized(
  en: string | null | undefined,
  bn: string | null | undefined,
): Promise<string> {
  const locale = await getLocale();
  return pickLocalized(locale, en, bn);
}
