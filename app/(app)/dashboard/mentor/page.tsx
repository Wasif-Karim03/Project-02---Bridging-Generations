import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { getAllStudents, getStudentBySlug } from "@/lib/content/students";
import { latestCallByStudent } from "@/lib/db/queries/mentorCalls";
import { getAssignmentsForMentor } from "@/lib/db/queries/weeklyReports";

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
  const [students, lastCalls, allStudents] = await Promise.all([
    Promise.all(slugs.map((s) => getStudentBySlug(s))),
    latestCallByStudent(slugs),
    getAllStudents(),
  ]);
  const assignedSet = new Set(slugs);
  const assignments = slugs.map((slug, i) => {
    const student = students[i];
    const last = lastCalls.get(slug)?.calledAt ?? null;
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Eyebrow>Mentor</Eyebrow>
          <h1 className="text-balance text-heading-1 text-ink">Your students.</h1>
          <p className="max-w-[60ch] text-body text-ink-2">
            Open a student to see their full record and collect a report after each call. The board
            and future mentors read these — they're how we notice when a student is struggling
            before the school does.
          </p>
        </div>
        <Link
          href="/dashboard/mentor/register-student"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
        >
          + Register Student
        </Link>
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
                    href={`/dashboard/mentor/student/${a.studentSlug}`}
                    className="mt-auto inline-flex min-h-[40px] items-center justify-center bg-accent px-3 text-nav-link uppercase text-white transition-colors hover:bg-accent-2-hover"
                  >
                    Open profile →
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
            Collect a report
          </h2>
          <Link
            href="/dashboard/mentor/calls/new"
            className="inline-flex min-h-[40px] items-center bg-accent px-4 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
          >
            Collect report →
          </Link>
        </header>
        <p className="text-body-sm text-ink-2">
          Call each assigned student twice a month. On the call, open their profile and collect a
          report — every question with its Bangla translation. Each report saves under the student
          for the board and future mentors to read.
        </p>
      </section>

      <section aria-labelledby="mentor-directory-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="mentor-directory-title" className="text-heading-3 text-ink">
            All students
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {allStudents.length} total
          </span>
        </header>
        <p className="text-body-sm text-ink-2">
          The full student directory. You can log calls and file reports for the students assigned
          to you; the rest are listed for reference (name, grade, school only).
        </p>
        {allStudents.length === 0 ? (
          <p className="border border-hairline border-dashed bg-ground-2 px-4 py-8 text-center text-body text-ink-2">
            No student profiles published yet. They appear here as the board adds students in the
            content editor.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Student</th>
                  <th className="py-3 pr-4 text-left">Grade</th>
                  <th className="py-3 pr-4 text-left">School</th>
                  <th className="py-3 text-right">Assigned to you</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map((s) => {
                  const mine = assignedSet.has(s.id);
                  return (
                    <tr key={s.id} className="border-b border-hairline last:border-b-0">
                      <td className="py-3 pr-4 align-top text-ink">
                        {mine ? (
                          <Link
                            href={`/dashboard/mentor/student/${s.id}`}
                            className="font-semibold text-accent underline underline-offset-[3px] hover:no-underline"
                          >
                            {s.displayName}
                          </Link>
                        ) : (
                          <span className="font-semibold">{s.displayName}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-top text-ink-2">{s.grade ?? "—"}</td>
                      <td className="py-3 pr-4 align-top text-ink-2">{s.schoolId ?? "—"}</td>
                      <td className="py-3 text-right align-top">
                        {mine ? (
                          <span className="inline-block bg-accent px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-white">
                            Yours
                          </span>
                        ) : (
                          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
