import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, isClerkConfigured, requireUserId } from "@/lib/auth";
import {
  donationsForCurrentMonth,
  donationsForPreviousMonth,
  formatDonationAmount,
  totalCents,
} from "@/lib/content/donationsMock";
import { getAllStudents } from "@/lib/content/students";
import { getDonationsForUser, getStudentsSponsoredByUser } from "@/lib/db/queries/donations";
import { donorCodeForUuid } from "@/lib/donor/donorCode";

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
  // Enforce Clerk sign-in. For DB-backed mode we additionally resolve the
  // local users row so queries can scope by the canonical UUID (not the Clerk
  // ID, which is a different namespace).
  const clerkUserId = await requireUserId();
  const usingMockData = !isDbConfigured();
  const dbUser = usingMockData ? null : await getCurrentDbUser();
  const queryUserId = dbUser?.id ?? clerkUserId;
  // Donor codes are derived from the local users.id UUID. In preview mode
  // (no DB) we don't yet have a UUID, so show "pending sync" instead of
  // deriving something malformed from the Clerk ID.
  const donorCode = dbUser ? donorCodeForUuid(dbUser.id) : null;
  const donorName = dbUser?.displayName ?? null;

  const [donations, sponsoredStudents, allStudents] = await Promise.all([
    getDonationsForUser(queryUserId),
    getStudentsSponsoredByUser(queryUserId),
    getAllStudents(),
  ]);
  const studentBySlug = new Map(allStudents.map((s) => [s.id, s]));

  const thisMonth = donationsForCurrentMonth(donations);
  const lastMonth = donationsForPreviousMonth(donations);
  const lifetime = totalCents(donations);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Donor dashboard</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">
          {donorName ? `Welcome, ${donorName}.` : "Your impact."}
        </h1>
        <p className="text-body text-ink-2">
          Your donor ID, the students you sponsor, your full transaction history, and your public
          profile on{" "}
          <Link
            href="/donors"
            className="text-accent underline underline-offset-[3px] hover:no-underline"
          >
            /donors
          </Link>
          .
        </p>
        {donorCode ? (
          <p className="mt-2 inline-flex items-center gap-2 self-start border border-hairline bg-ground-2 px-3 py-1.5 font-mono text-meta uppercase tracking-[0.08em] text-ink">
            <span className="text-ink-2">Donor ID</span>
            <span className="text-ink">{donorCode}</span>
          </p>
        ) : (
          <p className="mt-2 inline-flex items-center gap-2 self-start border border-hairline bg-ground-2 px-3 py-1.5 text-meta uppercase tracking-[0.08em] text-ink-2">
            Donor ID issues once your account syncs to the database (needs Neon + Clerk webhook).
          </p>
        )}
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

      <section aria-labelledby="students-supported-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="students-supported-title" className="text-heading-3 text-ink">
            Students you support
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {sponsoredStudents.length} {sponsoredStudents.length === 1 ? "student" : "students"}
          </span>
        </header>
        {sponsoredStudents.length === 0 ? (
          <p className="text-body text-ink-2">
            You haven't sponsored a specific student yet.{" "}
            <Link
              href="/students"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              Browse students
            </Link>{" "}
            and pick someone whose story moves you.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsoredStudents.map((s) => {
              const student = studentBySlug.get(s.studentSlug);
              const displayName = student?.displayName ?? s.studentSlug;
              return (
                <li
                  key={s.studentSlug}
                  className="flex flex-col gap-2 border border-hairline bg-ground-2 p-4"
                >
                  <Link
                    href={`/students/${s.studentSlug}`}
                    className="text-heading-5 text-ink hover:text-accent"
                  >
                    {displayName}
                  </Link>
                  <p className="text-display-3 tabular-nums text-ink">
                    {formatDonationAmount(s.totalCents)}
                  </p>
                  <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                    {s.giftCount} {s.giftCount === 1 ? "gift" : "gifts"} · last{" "}
                    <time dateTime={s.lastGiftAt.toISOString()}>
                      {dateFormatter.format(s.lastGiftAt)}
                    </time>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
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
                          {studentBySlug.get(d.studentSlug)?.displayName ?? d.studentSlug}
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
