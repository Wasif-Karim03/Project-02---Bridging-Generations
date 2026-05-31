import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import type { ApplicationStatus } from "@/lib/content/applicationsMock";
import { APPLICATION_KIND_LABEL, APPLICATION_STATUS_LABEL } from "@/lib/content/applicationsMock";
import { getRecentReviewActivity } from "@/lib/db/queries/auditLog";

export const metadata: Metadata = {
  title: "Audit log (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const stampFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function AdminAuditLogPage() {
  // Role check enforced by parent admin layout.
  const dbReady = isDbConfigured();
  const entries = dbReady ? await getRecentReviewActivity(100) : [];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Audit log.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Every application status change — who decided, when, and any reviewer notes left behind.
          Newest first. Click any row to open the application's full detail page. Status changes
          made through the inline dropdown on Overview also land here.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — audit log needs a live database to query.
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
          No reviews logged yet. Once admins approve, reject, or change the status of any
          application, the trail appears here.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.key} className="border border-hairline bg-ground-2 p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <time
                  dateTime={e.reviewedAt.toISOString()}
                  className="text-meta uppercase tracking-[0.06em] text-ink-2"
                >
                  {stampFormatter.format(e.reviewedAt)}
                </time>
                <span className="text-meta uppercase tracking-[0.06em] text-accent">
                  {APPLICATION_KIND_LABEL[e.kind] ?? e.kind}
                </span>
                <StatusBadge status={e.status} />
              </div>
              <p className="mt-2 text-body text-ink">
                <span className="font-semibold">
                  {e.reviewedByDisplayName ?? e.reviewedByEmail ?? "An admin"}
                </span>{" "}
                set{" "}
                <Link
                  href={`/dashboard/admin/applications/${e.kind}/${e.applicationId}`}
                  className="text-accent underline underline-offset-[3px] hover:no-underline"
                >
                  {e.applicantName}
                </Link>{" "}
                to <strong>{APPLICATION_STATUS_LABEL[e.status] ?? e.status}</strong>
              </p>
              {e.reviewerNotes ? (
                <p className="mt-2 whitespace-pre-line border-l-2 border-accent-3 pl-3 text-body-sm text-ink-2">
                  {e.reviewerNotes}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styleByStatus: Record<ApplicationStatus, string> = {
    submitted: "bg-accent-2 text-white",
    under_review: "bg-accent-3 text-ink",
    approved: "bg-accent text-white",
    rejected: "bg-accent-2-text text-white",
    withdrawn: "border border-hairline text-ink-2",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-meta uppercase tracking-[0.06em] ${styleByStatus[status]}`}
    >
      {APPLICATION_STATUS_LABEL[status] ?? status}
    </span>
  );
}
