import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { ReportHistory } from "@/components/mentor/ReportHistory";
import { getStudentBySlug } from "@/lib/content/students";
import { listStudentReportsWithMentor } from "@/lib/db/queries/mentorCalls";
import { listMentorsForStudent } from "@/lib/db/queries/weeklyReports";

export const metadata: Metadata = {
  title: "Student detail (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Role check enforced by the parent admin layout.
  const { slug } = await params;
  const [student, reports, mentorsAssigned] = await Promise.all([
    getStudentBySlug(slug),
    listStudentReportsWithMentor(slug),
    listMentorsForStudent(slug),
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
      <nav aria-label="Breadcrumb">
        <Link
          href="/dashboard/admin/students"
          className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
        >
          ← Students
        </Link>
      </nav>

      <header className="flex flex-col gap-2 border-b border-hairline pb-5">
        <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Student profile</p>
        <h1 className="text-balance text-heading-1 text-ink">{student.displayName}</h1>
        <p className="text-body text-ink-2">
          {reports.length} report{reports.length === 1 ? "" : "s"} collected by mentors.
        </p>
      </header>

      <section aria-labelledby="admin-student-mentors" className="flex flex-col gap-3">
        <h2 id="admin-student-mentors" className="text-heading-3 text-ink">
          Mentors
        </h2>
        {mentorsAssigned.length === 0 ? (
          <p className="text-body text-ink-2">No mentor is assigned to this student yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {mentorsAssigned.map((m) => (
              <li
                key={`${m.mentorName}-${m.assignedAt.toISOString()}`}
                className="flex flex-wrap items-baseline gap-2 text-body"
              >
                <span className="text-ink">{m.mentorName}</span>
                <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
                  since {dateFormatter.format(m.assignedAt)}
                  {m.endedAt ? ` · ended ${dateFormatter.format(m.endedAt)}` : " · active"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="admin-student-details" className="flex flex-col gap-4">
        <h2 id="admin-student-details" className="text-heading-3 text-ink">
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

      <section aria-labelledby="admin-student-reports" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 id="admin-student-reports" className="text-heading-3 text-ink">
            Report history
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {reports.length} total
          </span>
        </header>
        <ReportHistory reports={reports} emptyText="No reports collected for this student yet." />
      </section>
    </div>
  );
}
