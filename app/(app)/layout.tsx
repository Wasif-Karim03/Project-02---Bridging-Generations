import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Signed-in app shell. Reuses SiteChrome (Nav + Footer) but layers the
// dashboard sub-nav below it. /dashboard routes never appear in sitemap or
// SEO; we noindex via metadata.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <DashboardChrome>{children}</DashboardChrome>
    </SiteChrome>
  );
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-[6%] lg:py-12">
      <nav
        aria-label="Dashboard"
        className="mb-8 flex flex-wrap gap-2 border-b border-hairline pb-3 text-meta uppercase tracking-[0.08em]"
      >
        <Link href="/dashboard" className="text-ink-2 hover:text-accent">
          Overview
        </Link>
        <span aria-hidden="true" className="text-ink-2">
          ·
        </span>
        <Link href="/dashboard/donor" className="text-ink-2 hover:text-accent">
          Donor
        </Link>
        <span aria-hidden="true" className="text-ink-2">
          ·
        </span>
        <Link href="/dashboard/mentor" className="text-ink-2 hover:text-accent">
          Mentor
        </Link>
        <span aria-hidden="true" className="text-ink-2">
          ·
        </span>
        <Link href="/dashboard/admin" className="text-ink-2 hover:text-accent">
          Admin
        </Link>
      </nav>
      {children}
    </div>
  );
}
