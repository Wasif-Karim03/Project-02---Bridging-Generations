import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./routing";

// next-intl resolver — reads NEXT_LOCALE cookie, falls back to "en".
// Called once per server request.
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  // Top-level await of dynamic JSON imports — pattern recommended by next-intl
  // App Router setup. Webpack/Turbopack split each locale into its own chunk.
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
