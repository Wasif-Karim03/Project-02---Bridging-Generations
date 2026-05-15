import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, isClerkConfigured, requireRole } from "@/lib/auth";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { AdminSignOutButton } from "./_components/AdminSignOutButton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Admin-only sub-shell. Wraps every page under /dashboard/admin/* with a
// polished header (admin badge + section nav + sign-out) and asserts the
// admin role on every render. requireRole() lives in the layout — not in
// each page — so a new admin sub-page can never accidentally skip the gate.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  const clerkOn = isClerkConfigured();
  const dbReady = isDbConfigured();
  const dbUser = dbReady ? await getCurrentDbUser() : null;
  const adminName = dbUser?.displayName ?? dbUser?.email ?? "Admin";
  const adminBadge = dbUser ? donorCodeForUuid(dbUser.id).replace("BG-", "ADM-") : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-2 border-ink bg-ink px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-eyebrow uppercase tracking-[0.12em] text-accent-3">
            Staff portal · Restricted
          </p>
          <h2 className="text-heading-4 text-white">
            Signed in as <span className="font-semibold">{adminName}</span>
          </h2>
          {adminBadge ? (
            <p className="font-mono text-meta uppercase tracking-[0.08em] text-white/60">
              {adminBadge}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block bg-accent-3 px-2.5 py-1 text-meta uppercase tracking-[0.08em] text-ink">
            Role · Admin
          </span>
          {clerkOn ? <AdminSignOutButton /> : null}
        </div>
      </header>

      <nav
        aria-label="Admin sections"
        className="flex flex-wrap gap-x-5 gap-y-2 border-b border-hairline pb-3 text-meta uppercase tracking-[0.08em]"
      >
        <Link href="/dashboard/admin" className="text-ink hover:text-accent">
          Overview
        </Link>
        <Link href="/dashboard/admin#applications-title" className="text-ink-2 hover:text-accent">
          Applications
        </Link>
        <Link href="/dashboard/admin#donors-title" className="text-ink-2 hover:text-accent">
          Donors
        </Link>
        <Link href="/dashboard/admin/mentors" className="text-ink-2 hover:text-accent">
          Mentors
        </Link>
        <Link href="/dashboard/admin/users" className="text-ink-2 hover:text-accent">
          Users & roles
        </Link>
        <Link href="/dashboard/admin#exports-title" className="text-ink-2 hover:text-accent">
          Exports
        </Link>
      </nav>

      <div>{children}</div>
    </div>
  );
}
