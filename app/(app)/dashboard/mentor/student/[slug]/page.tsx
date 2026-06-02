import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { getStudentBySlug } from "@/lib/content/students";
import { listStudentReportsWithMentor } from "@/lib/db/queries/mentorCalls";
import { getAssignmentsForMentor } from "@/lib/db/queries/weeklyReports";
import { MENTOR_CALL_QUESTIONS, MENTOR_CALL_SECTIONS } from "@/lib/mentor/callQuestions";

export const metadata: Metadata = {
  title: "Student profile",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const promptById = new Map(MENTOR_CALL_QUESTIONS.map((q) => [q.id, q]));

export default async function MentorStudentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole("mentor");
  const { slug } = await params;
  const me = await getCurrentDbUser();

  // Access gate: a mentor may open the full profile only for students
  // assigned to them. Everyone else is directory-only (name/grade/school).
  const assignedSlugs = me ? await getAssignmentsForMentor(me.id) : [];
  if (!assignedSlugs.includes(slug)) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-6 text-body text-ink-2">
          This student isn't assigned to you, so you can only see their name, grade, and school in
          the directory. Ask an admin to assign them if you'll be mentoring them.
        </p>
      </div>
    );
  }

  const [student, reports] = await Promise.all([
    getStudentBySlug(slug),
    listStudentReportsWithMentor(slug),
  ]);
  if (!student) notFound();

  const details: Array<[string, string | number | null | undefined]> = [
    ["Grade", student.grade],
    ["School", student.schoolId],
    ["Region", student.region],
    ["Area", student.area],
    ["Village", student.village],
    ["GPA / grade", student.gpa],
    ["Hobby", student.hobby],
    ["Aspiration", student.quote],
    ["Life target", student.lifeTarget],
    ["Registration code", student.registrationCode],
    ["Sponsorship", student.sponsorshipStatus],
  ];
  const shownDetails = details.filter(([, v]) => v != null && String(v).trim() !== "");

  return (
    <div className="flex flex-col gap-10">
      <BackLink />

      <header className="flex flex-col gap-2 border-b border-hairline pb-5">
        <Eyebrow>Student profile</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">{student.displayName}</h1>
        <p className="text-body text-ink-2">
          {reports.length} report{reports.length === 1 ? "" : "s"} on file. The board and any future
          mentor can see this full history.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/mentor/calls/new?student=${slug}`}
            className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
          >
            Collect report →
          </Link>
          <Link
            href={`/dashboard/mentor/report?student=${slug}`}
            className="inline-flex min-h-[44px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
          >
            File weekly report
          </Link>
        </div>
      </header>

      <section aria-labelledby="student-details-title" className="flex flex-col gap-4">
        <h2 id="student-details-title" className="text-heading-3 text-ink">
          Details
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {shownDetails.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5 border-b border-hairline pb-2">
              <dt className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</dt>
              <dd className="text-body text-ink">{String(value)}</dd>
            </div>
          ))}
        </dl>
        {student.bio ? <p className="max-w-[65ch] text-body text-ink-2">{student.bio}</p> : null}
      </section>

      <section aria-labelledby="report-history-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="report-history-title" className="text-heading-3 text-ink">
            Report history
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {reports.length} total
          </span>
        </header>

        {reports.length === 0 ? (
          <p className="border border-hairline border-dashed bg-ground-2 px-4 py-8 text-center text-body text-ink-2">
            No reports collected for this student yet. Use <strong>Collect report</strong> after
            your call to record the first one.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reports.map((r) => (
              <li key={r.id}>
                <ReportCard
                  calledAt={r.calledAt}
                  mentorName={r.mentorName}
                  answers={(r.answers ?? {}) as Record<string, string>}
                  notes={r.notes}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <nav aria-label="Breadcrumb">
      <Link
        href="/dashboard/mentor"
        className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
      >
        ← Mentor dashboard
      </Link>
    </nav>
  );
}

// One collected report, with its answers grouped by the question sections so
// the read mirrors the collect-report form.
function ReportCard({
  calledAt,
  mentorName,
  answers,
  notes,
}: {
  calledAt: Date;
  mentorName: string;
  answers: Record<string, string>;
  notes: string | null;
}) {
  const answered = Object.keys(answers).filter((k) => answers[k]?.trim());
  return (
    <details className="border border-hairline bg-ground-2">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-ground-3">
        <span className="text-heading-5 text-ink">{dateFormatter.format(calledAt)}</span>
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
          {answered.length} answer{answered.length === 1 ? "" : "s"} · by {mentorName}
        </span>
      </summary>
      <div className="flex flex-col gap-5 border-hairline border-t px-4 py-4">
        {MENTOR_CALL_SECTIONS.map((sec) => {
          const rows = MENTOR_CALL_QUESTIONS.filter(
            (q) => q.section === sec.key && answers[q.id]?.trim(),
          );
          if (rows.length === 0) return null;
          return (
            <div key={sec.key} className="flex flex-col gap-2">
              <h4 className="text-eyebrow uppercase tracking-[0.1em] text-accent">{sec.title}</h4>
              <dl className="flex flex-col gap-2">
                {rows.map((q) => (
                  <div key={q.id} className="flex flex-col gap-0.5">
                    <dt className="text-body-sm text-ink-2">{q.prompt}</dt>
                    <dd className="whitespace-pre-line text-body text-ink">{answers[q.id]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
        {notes?.trim() ? (
          <div className="flex flex-col gap-0.5 border-hairline border-t pt-3">
            <span className="text-body-sm text-ink-2">Additional notes</span>
            <span className="whitespace-pre-line text-body text-ink">{notes}</span>
          </div>
        ) : null}
        {answered.length === 0 && !notes?.trim() ? (
          <p className="text-body-sm text-ink-2">No answers were recorded on this report.</p>
        ) : null}
      </div>
    </details>
  );
}
