import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { getStudentBySlug } from "@/lib/content/students";
import { getAssignmentsForMentor, getLatestReportPerStudent } from "@/lib/db/queries/weeklyReports";

export const metadata: Metadata = {
  title: "Mentor dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function MentorDashboard() {
  await requireRole("mentor");
  const dbReady = isDbConfigured();
  const dbUser = dbReady ? await getCurrentDbUser() : null;

  // Real assignments for the signed-in mentor (empty until the admin matches
  // them with students on /dashboard/admin/mentors/[id]).
  const slugs = dbUser ? await getAssignmentsForMentor(dbUser.id) : [];
  const [students, lastReports] = await Promise.all([
    Promise.all(slugs.map((s) => getStudentBySlug(s))),
    getLatestReportPerStudent(slugs),
  ]);
  const assignments = slugs.map((slug, i) => {
    const student = students[i];
    const last = lastReports[slug]?.weekOf ?? null;
    return {
      studentSlug: slug,
      studentName: student?.displayName ?? slug,
      grade: student?.grade ?? null,
      lastReport: last,
      weeksWithoutReport: last ? Math.floor((Date.now() - last.getTime()) / WEEK_MS) : null,
    };
  });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Mentor</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Your students.</h1>
        <p className="text-body text-ink-2">
          File a weekly report for each student you mentor. The board reads these — they're how we
          notice when a student is struggling before the school does.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — your assignments and report history appear once the database is connected.
        </p>
      ) : null}

      <section aria-labelledby="mentor-assignments-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="mentor-assignments-title" className="text-heading-3 text-ink">
            Assigned students
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {assignments.length} active
          </span>
        </header>
        {assignments.length === 0 ? (
          <p className="border border-hairline border-dashed bg-ground-2 px-4 py-8 text-center text-body text-ink-2">
            No students assigned to you yet. The board pairs you with students here once you're
            matched — you'll then file weekly reports for each.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((a) => {
              const overdue = a.weeksWithoutReport !== null && a.weeksWithoutReport >= 2;
              return (
                <li
                  key={a.studentSlug}
                  className={
                    overdue
                      ? "flex flex-col gap-3 border border-accent-2 bg-accent-2/5 p-5"
                      : "flex flex-col gap-3 border border-hairline bg-ground-2 p-5"
                  }
                >
                  {a.grade != null ? (
                    <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">
                      Grade {a.grade}
                    </span>
                  ) : null}
                  <h3 className="text-heading-5 text-ink">{a.studentName}</h3>
                  <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                    {a.lastReport
                      ? `Last report ${dateFormatter.format(a.lastReport)}`
                      : "No report yet"}
                  </p>
                  {overdue ? (
                    <p className="text-meta uppercase tracking-[0.06em] text-accent-2-text">
                      Overdue · {a.weeksWithoutReport} weeks
                    </p>
                  ) : null}
                  <Link
                    href={`/dashboard/mentor/report?student=${a.studentSlug}`}
                    className="mt-auto inline-flex min-h-[40px] items-center justify-center bg-accent px-3 text-nav-link uppercase text-white transition-colors hover:bg-accent-2-hover"
                  >
                    File weekly report
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="mentor-calls-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="mentor-calls-title" className="text-heading-3 text-ink">
            15-day calls
          </h2>
          <Link
            href="/dashboard/mentor/calls/new"
            className="inline-flex min-h-[40px] items-center bg-accent px-4 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
          >
            Log a call →
          </Link>
        </header>
        <p className="text-body-sm text-ink-2">
          The board expects a check-in call with each assigned student about every 15 days. Use the
          form to log what you discussed — the next-call date is auto-suggested 15 days out.
        </p>
      </section>
    </div>
  );
}
