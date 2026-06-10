import type { Metadata } from "next";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, isClerkConfigured, requireRole } from "@/lib/auth";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { AdminSidebar } from "./_components/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Admin-only sub-shell. Wraps every page under /dashboard/admin/* with a
// persistent left sidebar (nav + view-site + sign-out) and asserts the admin
// role on every render. requireRole() lives in the layout — not in each page —
// so a new admin sub-page can never accidentally skip the gate.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  const clerkOn = isClerkConfigured();
  const dbReady = isDbConfigured();
  const dbUser = dbReady ? await getCurrentDbUser() : null;
  const adminName = dbUser?.displayName ?? dbUser?.email ?? "Admin";
  const adminBadge = dbUser ? donorCodeForUuid(dbUser.id).replace("BG-", "ADM-") : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
      <AdminSidebar adminName={adminName} adminBadge={adminBadge} clerkOn={clerkOn} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
