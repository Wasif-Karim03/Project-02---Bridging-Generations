import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { formatDonationAmount } from "@/lib/content/donationsMock";
import {
  getRecentDonations,
  getRecurringBreakdown,
  getTopRecipientStudents,
  lastSevenDaysTotalCents,
  lifetimeTotalCents,
  thisMonthTotalCents,
  thisYearTotalCents,
} from "@/lib/db/queries/donations";
import { listAllDonors } from "@/lib/db/queries/donorProfiles";

export const metadata: Metadata = {
  title: "Donations (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminDonationsPage() {
  // Role check enforced by parent admin layout.
  const dbReady = isDbConfigured();
  const [lifetime, year, month, week, recurring, recipients, recentDonations, donors] =
    await Promise.all([
      lifetimeTotalCents(),
      thisYearTotalCents(),
      thisMonthTotalCents(),
      lastSevenDaysTotalCents(),
      getRecurringBreakdown(),
      getTopRecipientStudents(5),
      getRecentDonations(25),
      listAllDonors(200),
    ]);

  const topDonors = [...donors].sort((a, b) => b.lifetimeCents - a.lifetimeCents).slice(0, 5);
  const recurringTotalCents = recurring.recurringCents + recurring.oneTimeCents;
  const recurringShare = recurringTotalCents
    ? Math.round((recurring.recurringCents / recurringTotalCents) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Donations.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Money in, who's giving, and which students or projects are pulling support. Pulls from the
          donations table — every Stripe and bKash webhook writes here.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — totals will be zero until DATABASE_URL is set.
        </p>
      ) : null}

      <section aria-labelledby="totals-title" className="flex flex-col gap-4">
        <h2 id="totals-title" className="sr-only">
          Totals at a glance
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Last 7 days" value={formatDonationAmount(week)} sub="Rolling window" />
          <StatTile label="This month" value={formatDonationAmount(month)} sub="Calendar month" />
          <StatTile label="This year" value={formatDonationAmount(year)} sub="Calendar year" />
          <StatTile
            label="Lifetime"
            value={formatDonationAmount(lifetime)}
            sub="All time, all sources"
          />
        </div>
      </section>

      <section
        aria-labelledby="recurring-title"
        className="flex flex-col gap-4 border border-hairline bg-ground-2 p-5"
      >
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="recurring-title" className="text-heading-3 text-ink">
            Recurring vs one-time
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {recurringShare}% of dollars recur
          </span>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BreakdownTile
            label="Recurring"
            count={recurring.recurringCount}
            amount={formatDonationAmount(recurring.recurringCents)}
            sub="Subscriptions and standing orders"
          />
          <BreakdownTile
            label="One-time"
            count={recurring.oneTimeCount}
            amount={formatDonationAmount(recurring.oneTimeCents)}
            sub="Single-gift donations"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section aria-labelledby="top-donors-title" className="flex flex-col gap-4">
          <h2 id="top-donors-title" className="text-heading-3 text-ink">
            Top donors (lifetime)
          </h2>
          {topDonors.length === 0 ? (
            <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
              No donations yet. Once Stripe is wired and the first gift settles, donors appear here
              ranked by lifetime giving.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {topDonors.map((d, i) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-hairline pb-2 last:border-b-0"
                >
                  <span className="text-body text-ink">
                    <span className="mr-2 font-mono text-meta text-ink-2">{i + 1}.</span>
                    <Link
                      href={`/dashboard/admin/donors/${d.id}`}
                      className="text-accent underline underline-offset-[3px] hover:no-underline"
                    >
                      {d.anonymous ? `${d.publicInitials || "—"} (anon)` : d.legalName}
                    </Link>
                  </span>
                  <span className="text-body tabular-nums text-ink">
                    {formatDonationAmount(d.lifetimeCents)}{" "}
                    <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
                      · {d.donationCount} gift{d.donationCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="top-recipients-title" className="flex flex-col gap-4">
          <h2 id="top-recipients-title" className="text-heading-3 text-ink">
            Top recipient students
          </h2>
          {recipients.length === 0 ? (
            <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
              No student-attributed donations yet. Gifts donated to a specific student (via
              <code className="ml-1">?student=slug</code> on /donate) appear here ranked by total.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {recipients.map((r, i) => (
                <li
                  key={r.studentSlug}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-hairline pb-2 last:border-b-0"
                >
                  <span className="text-body text-ink">
                    <span className="mr-2 font-mono text-meta text-ink-2">{i + 1}.</span>
                    <Link
                      href={`/students/${r.studentSlug}`}
                      className="text-accent underline underline-offset-[3px] hover:no-underline"
                    >
                      {r.studentSlug}
                    </Link>
                  </span>
                  <span className="text-body tabular-nums text-ink">
                    {formatDonationAmount(r.totalCents)}{" "}
                    <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
                      · {r.giftCount} gift{r.giftCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section aria-labelledby="recent-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="recent-title" className="text-heading-3 text-ink">
            Recent donations
          </h2>
          <Link
            href="/api/export/donors.xlsx"
            className="inline-flex min-h-[36px] items-center border border-accent px-3 text-nav-link uppercase text-accent hover:bg-accent hover:text-white"
          >
            Export XLSX
          </Link>
        </header>
        {recentDonations.length === 0 ? (
          <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
            No donations recorded yet. The Stripe webhook writes here on every successful
            checkout.session.completed or invoice.paid event.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">When</th>
                  <th className="py-3 pr-4 text-left">Donor</th>
                  <th className="py-3 pr-4 text-left">Goes to</th>
                  <th className="py-3 pr-4 text-left">Type</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d) => (
                  <tr key={d.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={d.occurredAt.toISOString()}>
                        {dateFormatter.format(d.occurredAt)}
                      </time>
                    </td>
                    <td className="py-3 pr-4 align-top text-ink">
                      {d.donorDisplayName ?? d.donorEmail ?? "Anonymous"}
                    </td>
                    <td className="py-3 pr-4 align-top text-ink-2">
                      {d.studentSlug
                        ? `Student · ${d.studentSlug}`
                        : d.projectSlug
                          ? `Project · ${d.projectSlug}`
                          : "General fund"}
                    </td>
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      {d.recurring ? "Recurring" : "One-time"}
                    </td>
                    <td className="py-3 text-right align-top tabular-nums text-ink">
                      {formatDonationAmount(d.amountCents)}
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

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-heading-2 tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">{sub}</p>
    </div>
  );
}

function BreakdownTile({
  label,
  count,
  amount,
  sub,
}: {
  label: string;
  count: number;
  amount: string;
  sub: string;
}) {
  return (
    <div className="border border-hairline bg-ground p-4">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-heading-3 tabular-nums text-ink">{amount}</p>
      <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">
        {count} gift{count === 1 ? "" : "s"} · {sub}
      </p>
    </div>
  );
}
