import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { SignOutOnTabClose } from "@/components/layout/SignOutOnTabClose";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Signed-in app shell. Reuses SiteChrome (Nav + Footer) but layers the
// dashboard sub-nav below it. /dashboard routes never appear in sitemap or
// SEO; we noindex via metadata. ToastProvider wraps everything so any
// dashboard descendant can `useToast()` for success/error feedback.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SiteChrome>
        {isClerkConfigured() ? <SignOutOnTabClose /> : null}
        <DashboardChrome>{children}</DashboardChrome>
      </SiteChrome>
    </ToastProvider>
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
