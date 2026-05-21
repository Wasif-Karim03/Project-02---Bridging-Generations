import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { APPLICATION_KIND_LABEL, APPLICATION_STATUS_LABEL } from "@/lib/content/applicationsMock";
import { getAllApplications } from "@/lib/db/queries/applications";
import { ApplicationStatusControl } from "../_components/ApplicationStatusControl";
import { ApplicationFilters } from "./_components/ApplicationFilters";

export const metadata: Metadata = {
  title: "Applications (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const KINDS: ApplicationRow["kind"][] = ["scholarship", "mentor", "student-sponsorship"];
const STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function isValidKind(s: string | undefined): s is ApplicationRow["kind"] {
  return Boolean(s) && (KINDS as readonly string[]).includes(s as string);
}
function isValidStatus(s: string | undefined): s is ApplicationStatus {
  return Boolean(s) && (STATUSES as readonly string[]).includes(s as string);
}

export default async function AdminApplicationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string }>;
}) {
  // Role check is enforced by the parent admin layout.
  const dbReady = isDbConfigured();
  const sp = await searchParams;
  const statusFilter = isValidStatus(sp.status) ? sp.status : undefined;
  const kindFilter = isValidKind(sp.kind) ? sp.kind : undefined;

  const all = await getAllApplications();
  const filtered = all.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (kindFilter && a.kind !== kindFilter) return false;
    return true;
  });

  const counts = {
    all: all.length,
    submitted: all.filter((a) => a.status === "submitted").length,
    under_review: all.filter((a) => a.status === "under_review").length,
    approved: all.filter((a) => a.status === "approved").length,
    rejected: all.filter((a) => a.status === "rejected").length,
    withdrawn: all.filter((a) => a.status === "withdrawn").length,
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Applications.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Every scholarship, mentor, and student-sponsorship application across the org. Use the
          filters to focus on what's waiting on you. Click an applicant's name to read the full
          submission and leave reviewer notes.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — showing mock applications until DATABASE_URL is set.
        </p>
      ) : null}

      <section aria-labelledby="counts-title" className="flex flex-col gap-3">
        <h2 id="counts-title" className="sr-only">
          Application counts
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <CountTile label="All" value={counts.all} active={!statusFilter && !kindFilter} />
          <CountTile label="Submitted" value={counts.submitted} status="submitted" />
          <CountTile label="In review" value={counts.under_review} status="under_review" />
          <CountTile label="Approved" value={counts.approved} status="approved" />
          <CountTile label="Rejected" value={counts.rejected} status="rejected" />
          <CountTile label="Withdrawn" value={counts.withdrawn} status="withdrawn" />
        </div>
      </section>

      <ApplicationFilters statusFilter={statusFilter} kindFilter={kindFilter} />

      <section className="flex flex-col gap-3">
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          {filtered.length} of {all.length} {statusFilter || kindFilter ? "(filtered)" : "total"}
        </p>

        {filtered.length === 0 ? (
          <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
            No applications match the current filter.{" "}
            <Link
              href="/dashboard/admin/applications"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              Clear filters
            </Link>{" "}
            to see all rows.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Kind</th>
                  <th className="py-3 pr-4 text-left">Applicant</th>
                  <th className="py-3 pr-4 text-left">Summary</th>
                  <th className="py-3 pr-4 text-left">Submitted</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-accent">
                      {APPLICATION_KIND_LABEL[a.kind]}
                    </td>
                    <td className="py-3 pr-4 align-top text-ink">
                      <Link
                        href={`/dashboard/admin/applications/${a.kind}/${a.id}`}
                        className="font-semibold text-accent underline underline-offset-[3px] hover:no-underline"
                      >
                        {a.applicantName}
                      </Link>
                      <div className="text-meta text-ink-2">{a.email}</div>
                    </td>
                    <td className="py-3 pr-4 align-top text-ink-2">{a.summary}</td>
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={a.submittedAt.toISOString()}>
                        {dateFormatter.format(a.submittedAt)}
                      </time>
                    </td>
                    <td className="py-3 text-right align-top">
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={a.status} />
                        <ApplicationStatusControl kind={a.kind} id={a.id} current={a.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CountTile({
  label,
  value,
  status,
  active,
}: {
  label: string;
  value: number;
  status?: ApplicationStatus;
  active?: boolean;
}) {
  const href = status
    ? `/dashboard/admin/applications?status=${status}`
    : "/dashboard/admin/applications";
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col gap-1 border px-4 py-3 transition-colors ${
        active
          ? "border-accent bg-accent/10 text-ink"
          : "border-hairline bg-ground-2 text-ink hover:border-accent"
      }`}
    >
      <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</span>
      <span className="text-heading-3 tabular-nums text-ink">{value}</span>
    </Link>
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
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}
