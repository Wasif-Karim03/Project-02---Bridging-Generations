import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { listPendingUsers } from "@/lib/db/queries/users";
import { PendingActions } from "./_components/PendingActions";

export const metadata: Metadata = {
  title: "Pending signups",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Admin queue of users with status='pending'. Approve flips status to
// 'active' + emails the applicant their workspace is open. Reject flips
// to 'rejected' + emails them the soft no with optional reason.
export default async function PendingSignupsPage() {
  // Admin layout already enforces requireRole("admin") — no extra gate here.
  const pending = await listPendingUsers();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Eyebrow>Admin · Approval queue</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Pending signups.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Every new account starts here, regardless of role. Approve to give the user dashboard
          access; reject to soft-decline with an optional note that's sent to them by email.
        </p>
      </header>

      {pending.length === 0 ? (
        <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
          No signups awaiting review.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="py-3 pr-4 text-left">Email</th>
                <th className="py-3 pr-4 text-left">Name</th>
                <th className="py-3 pr-4 text-left">Role</th>
                <th className="py-3 pr-4 text-left">Submitted</th>
                <th className="py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id} className="border-b border-hairline last:border-b-0">
                  <td className="py-3 pr-4 align-top text-ink">{u.email}</td>
                  <td className="py-3 pr-4 align-top text-ink-2">{u.displayName ?? "—"}</td>
                  <td className="py-3 pr-4 align-top">
                    <span className="text-meta uppercase tracking-[0.06em] text-ink">{u.role}</span>
                  </td>
                  <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                    <time dateTime={u.createdAt.toISOString()}>
                      {dateFormatter.format(u.createdAt)}
                    </time>
                  </td>
                  <td className="py-3 align-top">
                    <PendingActions userId={u.id} />
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
