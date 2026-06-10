import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllApplications } from "@/lib/db/queries/applications";
import {
  getRecentDonations,
  getRecurringBreakdown,
  getTopRecipientStudents,
  lastMonthTotalCents,
  lifetimeTotalCents,
  thisMonthTotalCents,
  thisYearTotalCents,
} from "@/lib/db/queries/donations";
import { listAllDonors } from "@/lib/db/queries/donorProfiles";
import { listAllMentors, listAllStudentUsers } from "@/lib/db/queries/users";
import { AdminIcon, type AdminIconName } from "./_components/icons";
import { PageHeader } from "./_components/SectionScaffold";
import { APPLICATION_KIND_LABEL, APPLICATION_STATUS_LABEL, formatDonationAmount } from "./_data";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export default async function AdminDashboard() {
  // Role check is enforced by the parent admin layout — no need to repeat.
  const usingMockData = !isDbConfigured();
  const [
    applications,
    thisMonth,
    lastMonth,
    thisYear,
    lifetime,
    donorList,
    studentUsers,
    mentors,
    recurring,
    topRecipients,
    recentDonations,
  ] = await Promise.all([
    getAllApplications(),
    thisMonthTotalCents(),
    lastMonthTotalCents(),
    thisYearTotalCents(),
    lifetimeTotalCents(),
    listAllDonors(),
    listAllStudentUsers(),
    listAllMentors(),
    getRecurringBreakdown(),
    getTopRecipientStudents(5),
    getRecentDonations(6),
  ]);

  const needsAttention = applications.filter(
    (a) => a.status === "submitted" || a.status === "under_review",
  );

  // Month-over-month change, guarding against divide-by-zero.
  const monthDelta =
    lastMonth > 0
      ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
      : thisMonth > 0
        ? 100
        : 0;

  const recurringTotal = recurring.recurringCents + recurring.oneTimeCents;
  const recurringPct =
    recurringTotal > 0 ? Math.round((recurring.recurringCents / recurringTotal) * 100) : 0;
  const maxRecipient = topRecipients.reduce((m, r) => Math.max(m, r.totalCents), 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back."
        description="A snapshot of applications, students, mentors, and giving. Use the menu on the left to manage each part of the site."
      />

      {usingMockData ? (
        <p className="rounded-lg border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — real data appears once DATABASE_URL is set. Numbers below are sample data.
        </p>
      ) : null}

      {/* Headline numbers */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon="inbox"
          tone="coral"
          label="Needs review"
          value={String(needsAttention.length)}
          sub="Applications waiting"
          href="/dashboard/admin/applications"
        />
        <StatCard
          icon="students"
          tone="teal"
          label="Students"
          value={String(studentUsers.length)}
          sub="Registered accounts"
          href="/dashboard/admin/students"
        />
        <StatCard
          icon="users"
          tone="teal"
          label="Mentors"
          value={String(mentors.length)}
          sub="Active mentors"
          href="/dashboard/admin/users"
        />
        <StatCard
          icon="donators"
          tone="amber"
          label="Donators"
          value={String(donorList.length)}
          sub="Active accounts"
          href="/dashboard/admin/donors"
        />
      </section>

      {/* Giving visualizations */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* This month vs last month */}
        <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-ground-2 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-6 text-ink">Donations this month</h2>
            <DeltaBadge delta={monthDelta} />
          </div>
          <p className="text-heading-2 tabular-nums text-ink">{formatDonationAmount(thisMonth)}</p>
          <div className="flex flex-col gap-3">
            <CompareBar
              label="This month"
              value={thisMonth}
              max={Math.max(thisMonth, lastMonth, 1)}
              tone="teal"
            />
            <CompareBar
              label="Last month"
              value={lastMonth}
              max={Math.max(thisMonth, lastMonth, 1)}
              tone="muted"
            />
          </div>
          <div className="mt-1 grid grid-cols-2 gap-4 border-t border-hairline pt-4">
            <MiniStat label="This year" value={formatDonationAmount(thisYear)} />
            <MiniStat label="Lifetime" value={formatDonationAmount(lifetime)} />
          </div>
        </div>

        {/* Recurring vs one-time donut */}
        <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-ground-2 p-5">
          <h2 className="text-heading-6 text-ink">Recurring vs one-time</h2>
          <div className="flex items-center gap-5">
            <div
              className="relative size-28 shrink-0 rounded-full"
              style={{
                background: `conic-gradient(var(--color-accent) 0% ${recurringPct}%, var(--color-accent-3) ${recurringPct}% 100%)`,
              }}
            >
              <div className="absolute inset-[14px] grid place-items-center rounded-full bg-ground-2">
                <span className="text-heading-5 tabular-nums text-ink">{recurringPct}%</span>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-body-sm">
              <LegendRow
                swatch="bg-accent"
                label="Recurring"
                value={`${recurring.recurringCount} gifts`}
              />
              <LegendRow
                swatch="bg-accent-3"
                label="One-time"
                value={`${recurring.oneTimeCount} gifts`}
              />
            </ul>
          </div>
        </div>
      </section>

      {/* Top recipients + recent activity */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top students by funds raised */}
        <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-ground-2 p-5">
          <h2 className="text-heading-6 text-ink">Top students by funds raised</h2>
          {topRecipients.length === 0 ? (
            <EmptyNote>No student-directed donations yet.</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-3">
              {topRecipients.map((r) => (
                <li key={r.studentSlug} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/dashboard/admin/students/${r.studentSlug}`}
                      className="truncate text-body-sm text-accent hover:underline"
                    >
                      {r.studentSlug}
                    </Link>
                    <span className="shrink-0 tabular-nums text-body-sm text-ink">
                      {formatDonationAmount(r.totalCents)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ground-3">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${maxRecipient > 0 ? (r.totalCents / maxRecipient) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent donations */}
        <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-ground-2 p-5">
          <h2 className="text-heading-6 text-ink">Recent donations</h2>
          {recentDonations.length === 0 ? (
            <EmptyNote>No donations recorded yet.</EmptyNote>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm text-ink">
                      {d.donorDisplayName || d.donorEmail || "Anonymous"}
                    </p>
                    <p className="text-meta text-ink-2">
                      {d.recurring ? "Recurring · " : "One-time · "}
                      {dateFormatter.format(d.occurredAt)}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums text-body-sm font-medium text-ink">
                    {formatDonationAmount(d.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Applications needing attention */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-heading-5 text-ink">Applications needing attention</h2>
          <Link
            href="/dashboard/admin/applications"
            className="text-meta uppercase tracking-[0.06em] text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        {needsAttention.length === 0 ? (
          <p className="rounded-xl border border-hairline bg-ground-2 px-5 py-8 text-center text-body-sm text-ink-2">
            All caught up — no applications are waiting for review.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-hairline bg-ground-2">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="px-4 py-3 text-left">Kind</th>
                  <th className="px-4 py-3 text-left">Applicant</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {needsAttention.map((a) => (
                  <tr key={a.id} className="border-b border-hairline last:border-b-0">
                    <td className="px-4 py-3 align-top text-meta uppercase tracking-[0.06em] text-accent">
                      {APPLICATION_KIND_LABEL[a.kind]}
                    </td>
                    <td className="px-4 py-3 align-top text-ink">
                      <Link
                        href={`/dashboard/admin/applications/${a.kind}/${a.id}`}
                        className="font-medium text-accent underline underline-offset-[3px] hover:no-underline"
                      >
                        {a.applicantName}
                      </Link>
                      <div className="text-meta text-ink-2">{a.email}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={a.submittedAt.toISOString()}>
                        {dateFormatter.format(a.submittedAt)}
                      </time>
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-meta uppercase tracking-[0.06em] ${
                          a.status === "under_review"
                            ? "bg-accent-3 text-ink"
                            : "bg-accent-2 text-white"
                        }`}
                      >
                        {APPLICATION_STATUS_LABEL[a.status]}
                      </span>
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

const TONES: Record<string, { tint: string; fg: string }> = {
  teal: { tint: "bg-accent/10", fg: "text-accent" },
  coral: { tint: "bg-accent-2/10", fg: "text-accent-2-text" },
  amber: { tint: "bg-accent-3/20", fg: "text-ink" },
};

function StatCard({
  icon,
  tone,
  label,
  value,
  sub,
  href,
}: {
  icon: AdminIconName;
  tone: keyof typeof TONES;
  label: string;
  value: string;
  sub: string;
  href: string;
}) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-hairline bg-ground-2 p-5 transition-colors hover:border-accent"
    >
      <span className={`grid size-10 place-items-center rounded-xl ${t.tint} ${t.fg}`}>
        <AdminIcon name={icon} className="size-5" />
      </span>
      <div>
        <p className="text-heading-3 tabular-nums text-ink group-hover:text-accent">{value}</p>
        <p className="mt-0.5 text-body-sm font-medium text-ink">{label}</p>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">{sub}</p>
      </div>
    </Link>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="rounded-full bg-ground-3 px-2.5 py-1 text-meta uppercase tracking-[0.06em] text-ink-2">
        No change
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-meta uppercase tracking-[0.06em] ${
        up ? "bg-accent/10 text-accent" : "bg-accent-2/10 text-accent-2-text"
      }`}
    >
      <AdminIcon name={up ? "trendUp" : "trendDown"} className="size-3.5" />
      {up ? "+" : ""}
      {delta}% vs last month
    </span>
  );
}

function CompareBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "teal" | "muted";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-meta uppercase tracking-[0.06em] text-ink-2">
        {label}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-ground-3">
        <div
          className={`h-full rounded-full ${tone === "teal" ? "bg-accent" : "bg-ink-2/40"}`}
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right tabular-nums text-body-sm text-ink">
        {formatDonationAmount(value)}
      </span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</p>
      <p className="mt-0.5 text-heading-6 tabular-nums text-ink">{value}</p>
    </div>
  );
}

function LegendRow({ swatch, label, value }: { swatch: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={`size-3 shrink-0 rounded-sm ${swatch}`} />
      <span className="text-ink">{label}</span>
      <span className="text-ink-2">· {value}</span>
    </li>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-body-sm text-ink-2">{children}</p>;
}
