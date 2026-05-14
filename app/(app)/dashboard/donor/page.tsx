import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { isClerkConfigured, requireUserId } from "@/lib/auth";
import {
  donationsForCurrentMonth,
  donationsForPreviousMonth,
  formatDonationAmount,
  totalCents,
} from "@/lib/content/donationsMock";
import { getDonationsForUser } from "@/lib/db/queries/donations";

export const metadata: Metadata = {
  title: "Donor dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function DonorDashboard() {
  const userId = await requireUserId();

  // getDonationsForUser returns mock data when DATABASE_URL is unset and the
  // user's real donations when it is — same shape either way.
  const usingMockData = !isDbConfigured();
  const donations = await getDonationsForUser(userId);

  const thisMonth = donationsForCurrentMonth(donations);
  const lastMonth = donationsForPreviousMonth(donations);
  const lifetime = totalCents(donations);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Donor dashboard</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Your impact.</h1>
        <p className="text-body text-ink-2">
          Donation history, receipts, and the public donor profile we display on /donors.
        </p>
      </header>

      {usingMockData ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview data — real donation history appears once the database is provisioned (Phase 5).
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="This month"
          value={formatDonationAmount(totalCents(thisMonth))}
          sub={`${thisMonth.length} gift${thisMonth.length === 1 ? "" : "s"}`}
        />
        <Stat
          label="Last month"
          value={formatDonationAmount(totalCents(lastMonth))}
          sub={`${lastMonth.length} gift${lastMonth.length === 1 ? "" : "s"}`}
        />
        <Stat
          label="Lifetime"
          value={formatDonationAmount(lifetime)}
          sub={`${donations.length} gift${donations.length === 1 ? "" : "s"}`}
        />
      </section>

      <section aria-labelledby="donations-table-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="donations-table-title" className="text-heading-3 text-ink">
            All donations
          </h2>
          <div className="flex gap-2 text-nav-link uppercase">
            <Link
              href="/api/export/donations.pdf"
              className="border border-accent px-3 py-2 text-accent hover:bg-accent hover:text-white"
            >
              Download all (PDF)
            </Link>
          </div>
        </header>

        {donations.length === 0 ? (
          <p className="text-body text-ink-2">
            No donations yet — when you give, your receipts appear here automatically.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Date</th>
                  <th className="py-3 pr-4 text-left">Target</th>
                  <th className="py-3 pr-4 text-left">Dedicated to</th>
                  <th className="py-3 pr-4 text-right">Amount</th>
                  <th className="py-3 pr-4 text-left">Type</th>
                  <th className="py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-ink">
                      <time dateTime={d.occurredAt.toISOString()}>
                        {dateFormatter.format(d.occurredAt)}
                      </time>
                    </td>
                    <td className="py-3 pr-4 align-top text-ink">
                      {d.studentSlug ? (
                        <Link
                          href={`/students/${d.studentSlug}`}
                          className="text-accent underline underline-offset-[3px] hover:no-underline"
                        >
                          {d.studentSlug}
                        </Link>
                      ) : d.projectSlug ? (
                        <Link
                          href="/projects"
                          className="text-accent underline underline-offset-[3px] hover:no-underline"
                        >
                          {d.projectSlug}
                        </Link>
                      ) : (
                        <span className="text-ink-2">General fund</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top text-ink-2 italic">
                      {d.dedicationText || "—"}
                    </td>
                    <td className="py-3 pr-4 text-right align-top tabular-nums text-ink">
                      {formatDonationAmount(d.amountCents, d.currency)}
                    </td>
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      {d.recurring ? "Recurring" : "One-time"}
                    </td>
                    <td className="py-3 text-right align-top">
                      <Link
                        href={`/api/receipt/${d.id}.pdf`}
                        className="text-nav-link uppercase text-accent hover:text-accent-2-text"
                      >
                        PDF
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="profile-card-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="profile-card-title" className="text-heading-3 text-ink">
            Your public profile
          </h2>
          <Link
            href="/dashboard/donor/profile"
            className="text-nav-link uppercase text-accent hover:text-accent-2-text"
          >
            Edit →
          </Link>
        </header>
        <p className="max-w-[60ch] text-body-sm text-ink-2">
          The board never publishes donor amounts. You choose whether your name appears on{" "}
          <Link
            href="/donors"
            className="text-accent underline underline-offset-[3px] hover:no-underline"
          >
            /donors
          </Link>{" "}
          (or just your initials), and whether to add a short dedication line.
        </p>
      </section>

      {!isClerkConfigured() ? (
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Auth provider: Clerk · status: not yet configured (preview mode).
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-display-2 tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">{sub}</p>
    </div>
  );
}
