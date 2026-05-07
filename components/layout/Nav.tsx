"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";
import { SheetDrawer } from "@/components/ui/SheetDrawer";
import { donateCta, mobileNavGroups, primaryNav } from "@/content/fixtures/navigation";

// R4.9 active-state motif. Both swash (CoralArc-derived) and notch (2px coral
// block) were prototyped during the refinement gate; notch was chosen — the
// CoralArc reads as a hand-drawn brand mark at hero scale (280×40 viewBox)
// but its lenticular stroke loses weight at nav scale (40×8) and stops
// reading as "you are here" pre-cognitively. The notch is a definite
// typographic "you are here" punctuation.
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

type NavProps = {
  contactEmail?: string;
};

export function Nav({ contactEmail }: NavProps = {}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOnDonate = pathname?.startsWith("/donate") ?? false;

  // Manage focus across drawer transitions. SheetDrawer owns the focus-trap
  // while open but doesn't know which element opened or should land focus.
  // We need preventScroll on both: native dialog showModal + autoFocus would
  // scroll the page bringing the focused element "into view" even though
  // the dialog is fixed-position.
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

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <nav aria-label="Primary" className="fixed inset-x-0 top-0 z-50 h-14 bg-accent">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-[6%]">
          <Link
            href="/"
            // Brand text shrinks to text-body (16px) on the smallest iPhones
            // so the row "brand + donate chip + hamburger" doesn't squeeze
            // "Bridging Generations" onto two lines at 360–375px widths.
            className="inline-flex min-h-[44px] items-center whitespace-nowrap text-body font-bold tracking-[-0.005em] text-white transition-colors hover:text-accent-3 active:text-accent-3 sm:text-heading-6"
          >
            Bridging Generations
          </Link>
          <ul className="hidden items-center gap-8 lg:flex">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
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
                    {item.label}
                    {active ? <ActiveMotif /> : null}
                  </Link>
                </li>
              );
            })}
            {!isOnDonate && (
              <li>
                <Link
                  href={donateCta.href}
                  className="text-nav-link font-bold uppercase text-white transition-colors hover:text-accent-3 active:text-accent-3"
                >
                  {donateCta.label}
                </Link>
              </li>
            )}
          </ul>
          <div className="flex items-center gap-3 lg:hidden">
            {!isOnDonate && (
              // Mobile Donate shortcut — coral chip (sharp corners per design
              // system §4 Shape) so phone donors don't need to open the drawer
              // to convert. Label is 19px bold to satisfy WCAG AA "large text"
              // for white-on-accent-2 (3.09:1) — text-nav-link (13px semibold)
              // failed contrast.
              <Link
                href={donateCta.href}
                className="inline-flex min-h-[48px] items-center bg-accent-2 px-4 text-[19px] font-bold uppercase leading-none text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover active:bg-accent-2-hover"
              >
                {donateCta.label}
              </Link>
            )}
            <button
              ref={hamburgerRef}
              type="button"
              aria-expanded={open}
              aria-controls={open ? "mobile-menu" : undefined}
              aria-label={open ? "Close menu" : "Open menu"}
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
      <div className="lg:hidden">
        <SheetDrawer open={open} onClose={closeDrawer} ariaLabel="Site navigation" side="right">
          <div id="mobile-menu" className="flex flex-col px-6 py-6">
            <div className="flex items-start justify-between gap-4 pb-6">
              <div>
                <p className="text-heading-6 font-bold text-ink">Bridging Generations</p>
                <p className="mt-2 text-body-sm text-ink-2">Where would you like to go?</p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                aria-label="Close menu"
                onClick={closeDrawer}
                className="-mr-2 flex size-12 shrink-0 items-center justify-center text-ink transition-colors hover:text-accent active:text-accent focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {/* Donate prominent CTA — top of the drawer so the conversion path
                isn't buried inside a group. */}
            <Link
              href={donateCta.href}
              onClick={closeDrawer}
              className="menu-item-in flex min-h-[48px] items-center justify-center bg-accent-2 px-4 text-[19px] font-bold uppercase leading-none text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover active:bg-accent-2-hover"
            >
              {donateCta.label}
            </Link>
            {mobileNavGroups.map((group, gIndex) => (
              <section key={group.eyebrow} className="mt-6 border-t border-hairline pt-6">
                <p className="text-eyebrow uppercase text-ink-2">{group.eyebrow}</p>
                <ul className="mt-3 flex flex-col gap-1">
                  {group.items.map((item, i) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li
                        key={item.href}
                        className="menu-item-in"
                        // Stagger across all groups: gIndex offset + per-item index.
                        // 60ms steps matches the original drawer animation rhythm.
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
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {contactEmail ? (
              <p className="mt-6 border-t border-hairline pt-6 text-body-sm text-ink-2">
                Questions?{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-accent underline underline-offset-[3px] transition-colors hover:no-underline active:no-underline"
                >
                  {contactEmail}
                </a>
              </p>
            ) : null}
          </div>
        </SheetDrawer>
      </div>
    </>
  );
}
