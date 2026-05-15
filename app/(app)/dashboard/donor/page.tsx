import type { Metadata } from "next";
import Image from "next/image";
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
import { getAllSchools } from "@/lib/content/schools";
import { getAllStudents } from "@/lib/content/students";
import { getDonationsForUser, getStudentsSponsoredByUser } from "@/lib/db/queries/donations";
import { getLatestReportPerStudent } from "@/lib/db/queries/weeklyReports";
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

export default async function DonorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  // Enforce Clerk sign-in. For DB-backed mode we additionally resolve the
  // local users row so queries can scope by the canonical UUID (not the Clerk
  // ID, which is a different namespace).
  const clerkUserId = await requireUserId();
  const { welcome } = await searchParams;
  const showMentorPending = welcome === "mentor";
  const usingMockData = !isDbConfigured();
  const dbUser = usingMockData ? null : await getCurrentDbUser();
  const queryUserId = dbUser?.id ?? clerkUserId;
  // Donor codes are derived from the local users.id UUID. In preview mode
  // (no DB) we don't yet have a UUID, so show "pending sync" instead of
  // deriving something malformed from the Clerk ID.
  const donorCode = dbUser ? donorCodeForUuid(dbUser.id) : null;
  const donorName = dbUser?.displayName ?? null;

  const [donations, sponsoredStudents, allStudents, allSchools] = await Promise.all([
    getDonationsForUser(queryUserId),
    getStudentsSponsoredByUser(queryUserId),
    getAllStudents(),
    getAllSchools(),
  ]);
  const studentBySlug = new Map(allStudents.map((s) => [s.id, s]));
  const schoolById = new Map(allSchools.map((s) => [s.id, s]));
  // Fetch latest mentor reports for sponsored students only — cheap.
  const sponsoredSlugs = sponsoredStudents.map((s) => s.studentSlug);
  const latestReports = await getLatestReportPerStudent(sponsoredSlugs);

  // "Available students" = waiting-for-sponsor students this donor is NOT
  // already supporting. Surfaces in the "Browse students" section.
  const sponsoredSet = new Set(sponsoredSlugs);
  const availableStudents = allStudents.filter(
    (s) => s.sponsorshipStatus === "waiting" && !sponsoredSet.has(s.id),
  );

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

      {showMentorPending ? (
        <div className="border-2 border-accent bg-accent/5 px-5 py-4">
          <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">
            Mentor application · Under review
          </p>
          <p className="mt-2 text-body text-ink">
            Thanks for signing up to mentor. Our team reviews new mentor accounts within a few
            business days. You'll get an email once you're approved — then visit{" "}
            <Link
              href="/mentor-login"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /mentor-login
            </Link>{" "}
            to access your mentor dashboard.
          </p>
        </div>
      ) : null}

      {usingMockData ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — no database yet, so your dashboard starts empty. Donations + sponsored
          students appear once the org provisions Neon and you make your first gift.
        </p>
      ) : null}

      {/* First-time donor onboarding — fires whenever the donor has no gifts
          on record, whether that's because they're brand-new (DB-mode) or
          because we're in preview mode with empty queries. */}
      {donations.length === 0 ? (
        <section
          aria-labelledby="get-started-title"
          className="flex flex-col gap-4 border-2 border-accent bg-accent/5 px-5 py-6"
        >
          <h2 id="get-started-title" className="text-heading-4 text-ink">
            Welcome — here's what comes next.
          </h2>
          <p className="max-w-[60ch] text-body text-ink-2">
            Your donor account is live. Scroll down to "Browse students" to pick someone whose story
            moves you. Every gift shows up here within a minute, and you'll get a PDF tax receipt
            automatically.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#available-students-title"
              className="inline-flex min-h-[44px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
            >
              Browse students ↓
            </Link>
            <Link
              href="/projects"
              className="inline-flex min-h-[44px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
            >
              Browse projects
            </Link>
          </div>
          <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
            Tip: edit your public profile on{" "}
            <Link
              href="/dashboard/donor/profile"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              the profile page
            </Link>{" "}
            to choose whether your name shows on /donors.
          </p>
        </section>
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
            You haven't sponsored a specific student yet. Pick one from the "Browse students"
            section below.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sponsoredStudents.map((s) => {
              const student = studentBySlug.get(s.studentSlug);
              const displayName = student?.displayName ?? s.studentSlug;
              const school = student?.schoolId ? schoolById.get(student.schoolId) : undefined;
              const portraitOk =
                student?.consent?.portraitReleaseStatus === "granted" && student?.portrait?.src;
              const lastReport = latestReports[s.studentSlug];
              return (
                <li
                  key={s.studentSlug}
                  className="flex flex-col gap-3 border border-hairline bg-ground-2 p-4"
                >
                  {portraitOk ? (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground">
                      <Image
                        src={student.portrait?.src ?? ""}
                        alt={student.portrait?.alt ?? displayName}
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-ground text-meta uppercase tracking-[0.08em] text-ink-2">
                      Photo private
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/students/${s.studentSlug}`}
                      className="text-heading-5 text-ink hover:text-accent"
                    >
                      {displayName}
                    </Link>
                    <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                      Grade {student?.grade ?? "—"} · {school?.name ?? "School TBC"}
                    </p>
                  </div>
                  <dl className="flex flex-col gap-1 text-body-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-2">Your contribution</dt>
                      <dd className="tabular-nums text-ink">
                        {formatDonationAmount(s.totalCents)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-2">Gifts</dt>
                      <dd className="text-ink">
                        {s.giftCount} · last {dateFormatter.format(s.lastGiftAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-2">GPA</dt>
                      <dd className="text-ink">{student?.gpa ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-2">Status</dt>
                      <dd className="text-ink">
                        {student?.sponsorshipStatus === "sponsored" ? "Sponsored" : "Waiting"}
                      </dd>
                    </div>
                    {lastReport ? (
                      <div className="flex justify-between">
                        <dt className="text-ink-2">Last mentor update</dt>
                        <dd className="text-ink">
                          <time dateTime={lastReport.weekOf.toISOString()}>
                            {dateFormatter.format(lastReport.weekOf)}
                          </time>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="available-students-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="available-students-title" className="text-heading-3 text-ink">
            Browse students
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {availableStudents.length} waiting for a sponsor
          </span>
        </header>
        {availableStudents.length === 0 ? (
          <p className="text-body text-ink-2">
            Every student is currently sponsored. Check back soon — new students join each term.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {availableStudents.slice(0, 12).map((student) => {
              const school = student.schoolId ? schoolById.get(student.schoolId) : undefined;
              const portraitOk =
                student.consent?.portraitReleaseStatus === "granted" && student.portrait?.src;
              return (
                <li
                  key={student.id}
                  className="flex flex-col gap-3 border border-hairline bg-ground-2 p-4"
                >
                  {portraitOk ? (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground">
                      <Image
                        src={student.portrait?.src ?? ""}
                        alt={student.portrait?.alt ?? student.displayName}
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-ground text-meta uppercase tracking-[0.08em] text-ink-2">
                      Photo private
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/students/${student.id}`}
                      className="text-heading-5 text-ink hover:text-accent"
                    >
                      {student.displayName}
                    </Link>
                    <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                      Grade {student.grade ?? "—"} · {school?.name ?? "School TBC"}
                    </p>
                  </div>
                  {student.hobby ? (
                    <p className="text-body-sm text-ink-2">
                      <span className="text-ink-2">Hobby:</span> {student.hobby}
                    </p>
                  ) : null}
                  {student.lifeTarget ? (
                    <p className="text-body-sm text-ink-2 italic">
                      "{student.lifeTarget.slice(0, 120)}
                      {student.lifeTarget.length > 120 ? "…" : ""}"
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <Link
                      href={`/donate?student=${encodeURIComponent(student.id)}`}
                      className="inline-flex min-h-[40px] items-center justify-center bg-accent-2-text px-4 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
                    >
                      Sponsor {student.displayName?.split(" ")[0] ?? "this student"}
                    </Link>
                    <Link
                      href={`/students/${student.id}`}
                      className="text-meta uppercase tracking-[0.08em] text-accent hover:text-accent-2-text"
                    >
                      Full profile →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {availableStudents.length > 12 ? (
          <Link
            href="/students"
            className="self-start text-nav-link uppercase text-accent hover:text-accent-2-text"
          >
            See all {availableStudents.length} students waiting →
          </Link>
        ) : null}
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
