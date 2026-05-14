"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocaleAction } from "@/i18n/actions";
import { LOCALES, type Locale } from "@/i18n/routing";

type LanguageToggleProps = {
  /** "compact" for the desktop top-strip; "stacked" for the mobile drawer. */
  variant?: "compact" | "stacked";
  className?: string;
};

const LOCALE_BUTTON_LABEL: Record<Locale, string> = {
  en: "EN",
  bn: "বাংলা",
};

export function LanguageToggle({ variant = "compact", className }: LanguageToggleProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname() ?? "/";

  if (LOCALES.length < 2) return null;

  return (
    <form
      action={setLocaleAction}
      aria-label={t("languageToggle")}
      className={
        variant === "compact"
          ? `inline-flex items-center gap-1 ${className ?? ""}`
          : `inline-flex items-center gap-2 ${className ?? ""}`
      }
    >
      <input type="hidden" name="path" value={pathname} />
      {LOCALES.map((value) => {
        const isActive = value === locale;
        return (
          <button
            key={value}
            type="submit"
            name="locale"
            value={value}
            aria-pressed={isActive}
            className={
              variant === "compact"
                ? isActive
                  ? "inline-flex h-7 min-w-9 items-center justify-center bg-accent-3 px-2 text-meta font-semibold uppercase tracking-[0.06em] text-ink"
                  : "inline-flex h-7 min-w-9 items-center justify-center px-2 text-meta uppercase tracking-[0.06em] text-white/80 transition-colors hover:text-accent-3"
                : isActive
                  ? "inline-flex min-h-[40px] items-center bg-accent px-4 text-meta uppercase tracking-[0.06em] text-white"
                  : "inline-flex min-h-[40px] items-center border border-hairline px-4 text-meta uppercase tracking-[0.06em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
            }
          >
            {LOCALE_BUTTON_LABEL[value]}
          </button>
        );
      })}
    </form>
  );
}
