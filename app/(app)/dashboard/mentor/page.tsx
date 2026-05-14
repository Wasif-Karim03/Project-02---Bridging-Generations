import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mentor dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Mentor-mock for preview-mode (DB not yet wired). Each entry mirrors what
// a Drizzle read of mentor_student_assignments + weekly_reports will return.
const MOCK_ASSIGNMENTS = [
  {
    studentSlug: "priyonti-barua",
    studentName: "Priyonti Barua",
    grade: 12,
    lastReport: null as Date | null,
    weeksWithoutReport: 0,
  },
  {
    studentSlug: "trita-chakma",
    studentName: "Trita Chakma",
    grade: 9,
    lastReport: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    weeksWithoutReport: 1,
  },
  {
    studentSlug: "uthfol-jhorna-barua",
    studentName: "Uthfol Jhorna Barua",
    grade: 7,
    lastReport: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    weeksWithoutReport: 3,
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function MentorDashboard() {
  await requireRole("mentor");
  const usingMockData = !isDbConfigured();

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

      {usingMockData ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — your assignments and report history appear once Phase 4/6 lands.
        </p>
      ) : null}

      <section aria-labelledby="mentor-assignments-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="mentor-assignments-title" className="text-heading-3 text-ink">
            Assigned students
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {MOCK_ASSIGNMENTS.length} active
          </span>
        </header>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_ASSIGNMENTS.map((a) => {
            const overdue = a.weeksWithoutReport >= 2;
            return (
              <li
                key={a.studentSlug}
                className={
                  overdue
                    ? "flex flex-col gap-3 border border-accent-2 bg-accent-2/5 p-5"
                    : "flex flex-col gap-3 border border-hairline bg-ground-2 p-5"
                }
              >
                <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">
                  Grade {a.grade}
                </span>
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
      </section>

      <section aria-labelledby="mentor-history-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="mentor-history-title" className="text-heading-3 text-ink">
            Recent reports
          </h2>
        </header>
        <p className="text-body-sm text-ink-2">
          Your full history of weekly reports will appear here in chronological order — newest
          first. Phase 6 wires the reads from the weekly_reports table.
        </p>
      </section>
    </div>
  );
}
