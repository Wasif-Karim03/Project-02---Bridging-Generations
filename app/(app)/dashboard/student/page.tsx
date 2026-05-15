import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { getAllSchools } from "@/lib/content/schools";
import { getStudentBySlug } from "@/lib/content/students";
import { getLatestStudentRegistrationForUser } from "@/lib/db/queries/applications";
import { getDonorsForStudent } from "@/lib/db/queries/donations";

export const metadata: Metadata = {
  title: "Student dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Student dashboard. Three states:
//   1. No DB account yet (preview mode or webhook hasn't fired): show a
//      "complete your application" CTA pointing at the signup form.
//   2. Application submitted but admin hasn't linked a Keystatic slug yet:
//      show "Application under review" with the data they entered.
//   3. Linked: show their public profile, all donors who've given to them
//      (anonymized per the donor's setting), and total raised.

export default async function StudentDashboard() {
  await requireUserId();
  const dbReady = isDbConfigured();
  const dbUser = dbReady ? await getCurrentDbUser() : null;

  // Preview mode (no DB) — show a friendly demo of the three states.
  if (!dbReady || !dbUser) {
    return (
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Eyebrow>Student dashboard</Eyebrow>
          <h1 className="text-balance text-heading-1 text-ink">Your scholarship account.</h1>
          <p className="max-w-[60ch] text-body text-ink-2">
            Once you're approved + linked to a student profile, this page shows your sponsors, their
            donations, and your enrollment info.
          </p>
        </header>
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — real data appears once Neon Postgres is provisioned and an admin links your
          account to a student record.
        </p>
        <NextStepPanel />
      </div>
    );
  }

  // DB-ready: figure out which state this student is in.
  const registration = await getLatestStudentRegistrationForUser(dbUser.id);
  const studentSlug = dbUser.studentSlug;

  // State 1: no application yet
  if (!registration) {
    return (
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Eyebrow>Student dashboard</Eyebrow>
          <h1 className="text-balance text-heading-1 text-ink">Welcome.</h1>
          <p className="max-w-[60ch] text-body text-ink-2">
            You haven't submitted your scholarship application yet. Fill it out so our team can
            review you.
          </p>
        </header>
        <Link
          href="/student-signup/details"
          className="inline-flex min-h-[48px] w-fit items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
        >
          Complete your application →
        </Link>
      </div>
    );
  }

  // State 2: pending review (application submitted, admin hasn't linked slug yet)
  if (!studentSlug) {
    return (
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Eyebrow>Student dashboard</Eyebrow>
          <h1 className="text-balance text-heading-1 text-ink">Application under review.</h1>
          <p className="max-w-[60ch] text-body text-ink-2">
            Our board reviews every scholarship application carefully. You'll get an email once a
            decision is made — typically within a week.
          </p>
        </header>
        <PendingDetails registration={registration} />
      </div>
    );
  }

  // State 3: linked + active
  const [student, donors, allSchools] = await Promise.all([
    getStudentBySlug(studentSlug),
    getDonorsForStudent(studentSlug),
    getAllSchools(),
  ]);
  const school = student?.schoolId ? allSchools.find((s) => s.id === student.schoolId) : undefined;
  const portraitOk =
    student?.consent?.portraitReleaseStatus === "granted" && student?.portrait?.src;
  const totalRaisedCents = donors.reduce((sum, d) => sum + d.totalCents, 0);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Student dashboard · Approved</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">
          {student?.displayName ?? registration.studentName}
        </h1>
        <p className="font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
          Linked to {studentSlug}
        </p>
      </header>

      <section
        aria-labelledby="profile-title"
        className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]"
      >
        <h2 id="profile-title" className="sr-only">
          Your public profile
        </h2>
        {portraitOk ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2">
            <Image
              src={student?.portrait?.src ?? ""}
              alt={student?.portrait?.alt ?? student?.displayName ?? studentSlug}
              fill
              sizes="(min-width: 1024px) 280px, 90vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center bg-ground-2 text-meta uppercase tracking-[0.08em] text-ink-2">
            Photo not yet on file
          </div>
        )}
        <dl className="flex flex-col gap-3 text-body">
          <Row label="Grade" value={student?.grade ? String(student.grade) : "—"} />
          <Row label="School" value={school?.name ?? "—"} />
          <Row label="GPA" value={student?.gpa ?? "—"} />
          <Row label="Hobby" value={student?.hobby ?? "—"} />
          <Row label="Life target" value={student?.lifeTarget ?? "—"} />
          <Row label="Sponsorship status" value={student?.sponsorshipStatus ?? "—"} />
          <Row
            label="Public profile"
            value={
              <Link
                href={`/students/${studentSlug}`}
                className="text-accent underline underline-offset-[3px] hover:no-underline"
              >
                /students/{studentSlug}
              </Link>
            }
          />
        </dl>
      </section>

      <section aria-labelledby="totals-title" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <h2 id="totals-title" className="sr-only">
          Donations summary
        </h2>
        <Stat label="Total raised" value={currency.format(totalRaisedCents / 100)} />
        <Stat label="Sponsors" value={String(donors.length)} />
        <Stat
          label="Last gift"
          value={donors[0] ? dateFormatter.format(donors[0].lastGiftAt) : "—"}
        />
      </section>

      <section aria-labelledby="sponsors-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="sponsors-title" className="text-heading-3 text-ink">
            Your sponsors
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {donors.length} {donors.length === 1 ? "sponsor" : "sponsors"}
          </span>
        </header>
        {donors.length === 0 ? (
          <p className="text-body text-ink-2">
            No donations yet. When someone sponsors you, you'll see them here — they show up within
            a minute of giving.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Sponsor</th>
                  <th className="py-3 pr-4 text-right">Total given</th>
                  <th className="py-3 pr-4 text-right">Gifts</th>
                  <th className="py-3 text-right">Last gift</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d) => (
                  <tr
                    key={`${d.display}-${d.lastGiftAt.toISOString()}-${d.totalCents}`}
                    className="border-b border-hairline last:border-b-0"
                  >
                    <td className="py-3 pr-4 align-top text-ink">{d.display}</td>
                    <td className="py-3 pr-4 text-right align-top tabular-nums text-ink">
                      {currency.format(d.totalCents / 100)}
                    </td>
                    <td className="py-3 pr-4 text-right align-top tabular-nums text-ink-2">
                      {d.giftCount}
                    </td>
                    <td className="py-3 text-right align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={d.lastGiftAt.toISOString()}>
                        {dateFormatter.format(d.lastGiftAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          We respect donor anonymity — sponsors who chose to give anonymously are listed only by
          initials.
        </p>
      </section>
    </div>
  );
}

function NextStepPanel() {
  return (
    <section className="flex flex-col gap-3 border-2 border-accent bg-accent/5 px-5 py-6">
      <h2 className="text-heading-4 text-ink">Next: complete your application.</h2>
      <p className="max-w-[60ch] text-body text-ink-2">
        You created your account. The next step is to share your details so our team can review you.
        Once approved, you'll see who's sponsoring you and the donations they've made.
      </p>
      <Link
        href="/student-signup/details"
        className="inline-flex min-h-[44px] w-fit items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
      >
        Continue to application form →
      </Link>
    </section>
  );
}

function PendingDetails({
  registration,
}: {
  registration: {
    submittedAt: Date;
    studentName: string;
    grade: string;
    school: string;
    guardianName: string;
    message: string | null;
  };
}) {
  return (
    <section className="flex flex-col gap-4 border border-hairline bg-ground-2 p-6">
      <header>
        <h2 className="text-heading-4 text-ink">What you submitted</h2>
        <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">
          Submitted{" "}
          <time dateTime={registration.submittedAt.toISOString()}>
            {dateFormatter.format(registration.submittedAt)}
          </time>
        </p>
      </header>
      <dl className="flex flex-col gap-2 text-body-sm">
        <Row label="Student" value={registration.studentName} />
        <Row label="Grade" value={registration.grade} />
        <Row label="School" value={registration.school} />
        <Row label="Guardian" value={registration.guardianName} />
        {registration.message ? <Row label="Why applying" value={registration.message} /> : null}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
      <dt className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-display-3 tabular-nums text-ink">{value}</p>
    </div>
  );
}
