"use client";

import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { SheetDrawer } from "@/components/ui/SheetDrawer";
import {
  donateCta,
  mobileNavGroups,
  type NavDropdownItem,
  primaryNav,
} from "@/content/fixtures/navigation";

// Resolve a nav item's display label: use the translated string when a
// labelKey is set, otherwise fall back to the English `label` from the fixture.
// `t` is bound to the "nav" namespace via useTranslations("nav").
function resolveLabel(
  t: ReturnType<typeof useTranslations>,
  item: { label: string; labelKey?: string },
): string {
  if (!item.labelKey) return item.label;
  try {
    return t(item.labelKey);
  } catch {
    return item.label;
  }
}

// R4.9 active-state motif. Notch (2px coral block) reads as a definite
// typographic "you are here" punctuation at nav scale.
function ActiveMotif() {
  return (
    <span
      aria-hidden="true"
      className="nav-active-motif pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-8 -translate-x-1/2 bg-accent-2-text"
    />
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasDropdown(item: (typeof primaryNav)[number]): item is (typeof primaryNav)[number] & {
  dropdown: NavDropdownItem[];
} {
  return "dropdown" in item && Array.isArray(item.dropdown);
}

type NavProps = {
  contactEmail?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
};

export function Nav({ contactEmail, phoneNumber, whatsappNumber }: NavProps = {}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOnDonate =
    (pathname?.startsWith("/donate") ?? false) || (pathname?.startsWith("/be-a-donor") ?? false);

  // Manage focus across drawer transitions. SheetDrawer owns the focus-trap
  // while open but doesn't know which element opened or should land focus.
  // preventScroll: true on both — native dialog showModal + autoFocus would
  // scroll the page even though the dialog is fixed-position.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      queueMicrotask(() => {
        closeButtonRef.current?.focus({ preventScroll: true });
      });
    } else if (wasOpenRef.current) {
      hamburgerRef.current?.focus({ preventScroll: true });
      wasOpenRef.current = false;
    }
  }, [open]);

  // Close any open desktop dropdown when route changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the explicit trigger — the body just resets, but we need a re-run on every navigation.
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  // Close dropdowns on outside click / escape.
  useEffect(() => {
    if (!openDropdown) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav-dropdown]")) setOpenDropdown(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openDropdown]);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      {/* Contact strip — phone + email + language toggle at the top per spec.
          Hidden on mobile to keep the chrome compact; mobile drawer surfaces them. */}
      <div className="hidden border-b border-white/15 bg-accent text-white lg:block">
        <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-end gap-6 px-4 sm:px-6 lg:px-[6%]">
          {phoneNumber ? (
            <a
              href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 text-meta uppercase tracking-[0.04em] transition-colors hover:text-accent-3"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span>{phoneNumber}</span>
            </a>
          ) : null}
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-1.5 text-meta normal-case transition-colors hover:text-accent-3"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              <span>{contactEmail}</span>
            </a>
          ) : null}
          <LanguageToggle variant="compact" />
        </div>
      </div>

      <nav aria-label="Primary" className="fixed inset-x-0 top-0 z-50 bg-accent lg:top-9">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-[6%]">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center whitespace-nowrap text-body font-bold tracking-[-0.005em] text-white transition-colors hover:text-accent-3 active:text-accent-3 sm:text-heading-6"
          >
            Bridging Generations
          </Link>
          <ul className="hidden items-center gap-7 lg:flex">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              const label = resolveLabel(t, item);
              if (hasDropdown(item)) {
                const isOpen = openDropdown === item.href;
                return (
                  <li key={item.href} data-nav-dropdown className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isOpen ? null : item.href)}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      className={
                        active
                          ? "relative inline-flex items-center gap-1 text-nav-link font-bold uppercase text-white transition-colors"
                          : "inline-flex items-center gap-1 text-nav-link uppercase text-white transition-colors hover:text-accent-3 active:text-accent-3"
                      }
                    >
                      {label}
                      <ChevronDown
                        className={
                          isOpen
                            ? "size-3 transition-transform rotate-180"
                            : "size-3 transition-transform"
                        }
                        aria-hidden="true"
                      />
                      {active ? <ActiveMotif /> : null}
                    </button>
                    {isOpen ? (
                      <div
                        role="menu"
                        className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 shape-bevel border border-hairline bg-ground-2 p-3 shadow-[var(--shadow-card-hover)]"
                      >
                        <ul className="flex flex-col gap-1">
                          {item.dropdown.map((d) => {
                            const dLabel = resolveLabel(t, d);
                            const dDesc = d.descriptionKey ? t(d.descriptionKey) : d.description;
                            return (
                              <li key={d.href}>
                                <Link
                                  href={d.href}
                                  role="menuitem"
                                  onClick={() => setOpenDropdown(null)}
                                  className="block px-3 py-2 transition-colors hover:bg-ground-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                                >
                                  <span className="block text-body-sm font-semibold text-ink">
                                    {dLabel}
                                  </span>
                                  {dDesc ? (
                                    <span className="mt-0.5 block text-meta text-ink-2 normal-case">
                                      {dDesc}
                                    </span>
                                  ) : null}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "relative text-nav-link font-bold uppercase text-white transition-colors"
                        : "text-nav-link uppercase text-white transition-colors hover:text-accent-3 active:text-accent-3"
                    }
                  >
                    {label}
                    {active ? <ActiveMotif /> : null}
                  </Link>
                </li>
              );
            })}
            {!isOnDonate && (
              <li>
                <Link
                  href={donateCta.href}
                  className="inline-flex h-9 items-center bg-accent-2-text px-4 text-nav-link font-bold uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover active:bg-accent-2-hover"
                >
                  {t("donate")}
                </Link>
              </li>
            )}
          </ul>
          <div className="flex items-center gap-3 lg:hidden">
            {!isOnDonate && (
              <Link
                href={donateCta.href}
                className="inline-flex min-h-[48px] items-center bg-accent-2 px-4 text-[19px] font-bold uppercase leading-none text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover active:bg-accent-2-hover"
              >
                {t("donate")}
              </Link>
            )}
            <button
              ref={hamburgerRef}
              type="button"
              aria-expanded={open}
              aria-controls={open ? "mobile-menu" : undefined}
              aria-label={open ? t("closeMenu") : t("openMenu")}
              onClick={() => setOpen((v) => !v)}
              className="flex size-12 items-center justify-center text-white transition-colors hover:text-accent-3 active:text-accent-3"
            >
              {open ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* WhatsApp floating button — bottom-right on all viewports.
          Only renders when a whatsappNumber is configured in siteSettings. */}
      {whatsappNumber ? (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-40 inline-flex size-14 items-center justify-center bg-[#25D366] text-white shadow-[var(--shadow-cta)] transition-transform hover:scale-105 focus-visible:scale-105 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent rounded-full"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            fill="currentColor"
            role="img"
            aria-label={t("whatsAppLabel")}
          >
            <title>{t("whatsAppLabel")}</title>
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      ) : null}

      <div className="lg:hidden">
        <SheetDrawer open={open} onClose={closeDrawer} ariaLabel="Site navigation" side="right">
          <div id="mobile-menu" className="flex flex-col px-6 py-6">
            <div className="flex items-start justify-between gap-4 pb-6">
              <div>
                <p className="text-heading-6 font-bold text-ink">Bridging Generations</p>
                <p className="mt-2 text-body-sm text-ink-2">{t("mobileDrawerWhereTo")}</p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                aria-label={t("closeMenu")}
                onClick={closeDrawer}
                className="-mr-2 flex size-12 shrink-0 items-center justify-center text-ink transition-colors hover:text-accent active:text-accent focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <Link
              href={donateCta.href}
              onClick={closeDrawer}
              className="menu-item-in flex min-h-[48px] items-center justify-center bg-accent-2 px-4 text-[19px] font-bold uppercase leading-none text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover active:bg-accent-2-hover"
            >
              {t("donate")}
            </Link>
            {mobileNavGroups.map((group, gIndex) => (
              <section key={group.eyebrow} className="mt-6 border-t border-hairline pt-6">
                <p className="text-eyebrow uppercase text-ink-2">
                  {group.eyebrowKey ? t(group.eyebrowKey) : group.eyebrow}
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {group.items.map((item, i) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li
                        key={item.href}
                        className="menu-item-in"
                        style={{ animationDelay: `${(gIndex * 4 + i + 1) * 60}ms` }}
                      >
                        <Link
                          href={item.href}
                          onClick={closeDrawer}
                          aria-current={active ? "page" : undefined}
                          className={
                            active
                              ? "-mx-3 flex min-h-[44px] items-center px-3 text-heading-5 font-bold text-accent transition-colors active:bg-ground-3"
                              : "-mx-3 flex min-h-[44px] items-center px-3 text-heading-5 text-ink transition-colors active:bg-ground-3"
                          }
                        >
                          {resolveLabel(t, item)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            <section className="mt-6 border-t border-hairline pt-6">
              <p className="text-eyebrow uppercase text-ink-2">{t("languageToggle")}</p>
              <div className="mt-3">
                <LanguageToggle variant="stacked" />
              </div>
            </section>
            {phoneNumber || contactEmail ? (
              <section className="mt-6 border-t border-hairline pt-6">
                <p className="text-eyebrow uppercase text-ink-2">{t("questions")}</p>
                <ul className="mt-3 flex flex-col gap-2 text-body-sm">
                  {phoneNumber ? (
                    <li>
                      <a
                        href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
                        className="inline-flex min-h-[44px] items-center gap-2 text-ink"
                      >
                        <Phone className="size-4 text-accent" aria-hidden="true" />
                        {phoneNumber}
                      </a>
                    </li>
                  ) : null}
                  {contactEmail ? (
                    <li>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="inline-flex min-h-[44px] items-center gap-2 text-ink break-all"
                      >
                        <Mail className="size-4 text-accent" aria-hidden="true" />
                        {contactEmail}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </section>
            ) : null}
          </div>
        </SheetDrawer>
      </div>
    </>
  );
}
