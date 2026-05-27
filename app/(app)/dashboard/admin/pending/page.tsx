import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { listPendingUsers } from "@/lib/db/queries/users";
import { PendingQueue } from "./_components/PendingQueue";

export const metadata: Metadata = {
  title: "Pending signups",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Admin queue of users with status='pending'. Approve flips status to
// 'active' + emails the applicant their workspace is open. Reject flips
// to 'rejected' + emails them the soft no with optional reason. The
// PendingQueue client component handles row selection + bulk actions +
// the desktop-table / mobile-card responsive switch.
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
          access; reject to soft-decline with an optional note that's sent to them by email. Use the
          checkboxes for bulk approve / reject across multiple rows.
        </p>
      </header>

      {pending.length === 0 ? (
        <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
          No signups awaiting review.
        </p>
      ) : (
        <PendingQueue
          rows={pending.map((u) => ({
            id: u.id,
            email: u.email,
            displayName: u.displayName,
            role: u.role,
            createdAt: u.createdAt,
          }))}
        />
      )}
    </div>
  );
}
