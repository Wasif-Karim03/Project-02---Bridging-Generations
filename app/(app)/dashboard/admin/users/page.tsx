import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { requireRole } from "@/lib/auth";
import { listAllUsers } from "@/lib/db/queries/users";
import { UserRoleSelect } from "./_components/UserRoleSelect";

export const metadata: Metadata = {
  title: "Users (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminUsersPage() {
  await requireRole("admin");
  const dbReady = isDbConfigured();
  const users = await listAllUsers();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb">
          <Link
            href="/dashboard/admin"
            className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
          >
            ← Admin dashboard
          </Link>
        </nav>
        <Eyebrow>Users</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Roles & access.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Promote a donor to mentor after their application is approved, or grant admin / IT access
          to board members. Roles take effect on the next page load for that user.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — no database yet, so the user list is empty. Provision Neon via Vercel
          Marketplace to populate this table.
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="text-body text-ink-2">
          No users in the database yet.{" "}
          {dbReady
            ? "Users appear here automatically after they sign up through Clerk (the webhook syncs them)."
            : "Configure DATABASE_URL + run npm run db:push to populate."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="py-3 pr-4 text-left">Email</th>
                <th className="py-3 pr-4 text-left">Display name</th>
                <th className="py-3 pr-4 text-left">Clerk ID</th>
                <th className="py-3 pr-4 text-left">Joined</th>
                <th className="py-3 text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-hairline last:border-b-0">
                  <td className="py-3 pr-4 align-top text-ink">{u.email}</td>
                  <td className="py-3 pr-4 align-top text-ink-2">{u.displayName ?? "—"}</td>
                  <td className="py-3 pr-4 align-top font-mono text-meta text-ink-2">
                    {u.clerkUserId.slice(0, 12)}…
                  </td>
                  <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                    <time dateTime={u.createdAt.toISOString()}>
                      {dateFormatter.format(u.createdAt)}
                    </time>
                  </td>
                  <td className="py-3 text-right align-top">
                    {/* `anonymous` is the seed role for brand-new Clerk users
                        between sign-up and the webhook firing — it shouldn't
                        be a target role, so we display it as a stale-state
                        warning instead of feeding it into the select. */}
                    {u.role === "anonymous" ? (
                      <span className="text-meta uppercase tracking-[0.06em] text-accent-2-text">
                        Pending sync
                      </span>
                    ) : (
                      <UserRoleSelect userId={u.id} current={u.role} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
