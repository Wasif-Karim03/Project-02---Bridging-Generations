import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { requireRole } from "@/lib/auth";
import { getAllApplications } from "@/lib/db/queries/applications";
import { thisMonthTotalCents } from "@/lib/db/queries/donations";
import { ApplicationStatusControl } from "./_components/ApplicationStatusControl";
import {
  APPLICATION_KIND_LABEL,
  APPLICATION_STATUS_LABEL,
  formatDonationAmount,
  MOCK_DONOR_LIST,
} from "./_data";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminDashboard() {
  await requireRole("admin");

  const usingMockData = !isDbConfigured();
  const [applications, totalMonthCents] = await Promise.all([
    getAllApplications(),
    thisMonthTotalCents(),
  ]);
  const newApps = applications.filter((a) => a.status === "submitted");
  const inReviewApps = applications.filter((a) => a.status === "under_review");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Org dashboard.</h1>
        <p className="text-body text-ink-2">
          Review applications, manage donor visibility, assign mentors, and export rosters.
        </p>
      </header>

      {usingMockData ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — real data appears once DATABASE_URL is set and Phase 4/5 reads land.
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat label="New apps" value={String(newApps.length)} sub="Awaiting review" />
        <Stat label="In review" value={String(inReviewApps.length)} sub="With a reviewer" />
        <Stat
          label="This month"
          value={formatDonationAmount(totalMonthCents)}
          sub="Donations received"
        />
        <Stat label="Donors total" value={String(MOCK_DONOR_LIST.length)} sub="Active accounts" />
      </section>

      <section aria-labelledby="applications-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="applications-title" className="text-heading-3 text-ink">
            Application queue
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {applications.length} total
          </span>
        </header>

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
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-hairline last:border-b-0">
                  <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-accent">
                    {APPLICATION_KIND_LABEL[a.kind]}
                  </td>
                  <td className="py-3 pr-4 align-top text-ink">
                    <div className="font-semibold">{a.applicantName}</div>
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
                      <span
                        className={
                          a.status === "submitted"
                            ? "inline-block bg-accent-2 px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-white"
                            : a.status === "approved"
                              ? "inline-block bg-accent px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-white"
                              : "inline-block border border-hairline px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-ink-2"
                        }
                      >
                        {APPLICATION_STATUS_LABEL[a.status]}
                      </span>
                      <ApplicationStatusControl kind={a.kind} id={a.id} current={a.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="donors-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="donors-title" className="text-heading-3 text-ink">
            Donors
          </h2>
          <div className="flex gap-2">
            <Link
              href="/api/export/donors.xlsx"
              className="inline-flex min-h-[36px] items-center border border-accent px-3 text-nav-link uppercase text-accent hover:bg-accent hover:text-white"
            >
              Export XLSX
            </Link>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="py-3 pr-4 text-left">Legal name</th>
                <th className="py-3 pr-4 text-left">Public</th>
                <th className="py-3 pr-4 text-right">Lifetime</th>
                <th className="py-3 pr-4 text-right">Gifts</th>
                <th className="py-3 text-right">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DONOR_LIST.map((d) => (
                <tr key={d.id} className="border-b border-hairline last:border-b-0">
                  <td className="py-3 pr-4 text-ink">{d.legalName}</td>
                  <td className="py-3 pr-4 text-ink-2">{d.publicInitials || "—"}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-ink">
                    {formatDonationAmount(d.lifetimeCents)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-ink-2">
                    {d.donationCount}
                  </td>
                  <td className="py-3 text-right text-meta uppercase tracking-[0.06em] text-ink-2">
                    {d.anonymous ? "Anon · initials only" : "Public · name shown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="exports-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="exports-title" className="text-heading-3 text-ink">
            Exports
          </h2>
        </header>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ExportLink href="/api/export/students.xlsx" label="Students (XLSX)" />
          <ExportLink href="/api/export/teachers.xlsx" label="Teachers (XLSX)" />
          <ExportLink href="/api/export/donors.xlsx" label="Donors (XLSX)" />
        </ul>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Exports respect the consent gate — students whose photoReleaseStatus is not "granted"
          appear by name + grade only, never with portrait or full address.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-heading-2 tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">{sub}</p>
    </div>
  );
}

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-[44px] w-full items-center justify-center border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
      >
        {label}
      </Link>
    </li>
  );
}
