import type { Metadata } from "next";
import Link from "next/link";
import { pagesByGroup } from "@/lib/developer/pages";
import { isAuthenticated } from "@/lib/developer/session";
import { DeveloperSidebar } from "./developer/_components/DeveloperSidebar";
import { LogoutButton } from "./developer/_components/LogoutButton";

export const metadata: Metadata = {
  title: "Site editor — Bridging Generations",
  robots: { index: false, follow: false },
};

const GLOBAL_NAV = [
  { href: "/developer", label: "Dashboard" },
  { href: "/developer/siteSettings", label: "Site settings" },
  { href: "/developer/translations", label: "All page text" },
  { href: "/developer/media", label: "Media library" },
];

// Standalone surface for the password-gated content editor. Overrides the
// marketing-site chrome with a calm app surface: a persistent top bar plus a
// left sidebar (when signed in) that mirrors the pages of the live website.
export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  const groups = pagesByGroup().map((g) => ({
    group: g.group,
    items: g.pages.map((p) => ({ href: `/developer/pages/${p.key}`, label: p.label })),
  }));

  return (
    <div className="min-h-screen bg-ground text-ink">
      <header className="sticky top-0 z-40 border-b border-hairline bg-ground-2/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link href="/developer" className="flex flex-col leading-tight">
            <span className="font-semibold text-ink">Bridging Generations</span>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-2">Site editor</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-meta uppercase tracking-[0.06em] text-accent transition-colors hover:text-accent-2-text"
            >
              View live site ↗
            </Link>
            {authed ? <LogoutButton /> : null}
          </div>
        </div>
      </header>

      {authed ? (
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[260px_1fr]">
          <DeveloperSidebar global={GLOBAL_NAV} groups={groups} />
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
