import type { Metadata } from "next";
import { isDbConfigured } from "@/db/client";
import { listAllUsers } from "@/lib/db/queries/users";
import { UsersTableWithSearch } from "./_components/UsersTableWithSearch";

export const metadata: Metadata = {
  title: "Users (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Role check is enforced by the parent admin layout.
  const dbReady = isDbConfigured();
  const users = await listAllUsers();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Users & roles.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Promote a donor to mentor after their application is approved, or grant admin / IT access
          to board members. Roles take effect on the next page load for that user. Use the search
          box to find a specific account.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — no database yet, so the user list is empty. Provision Neon Postgres to
          populate this table.
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
        <UsersTableWithSearch users={users} />
      )}
    </div>
  );
}
