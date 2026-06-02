import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { getAllStudents } from "@/lib/content/students";
import { getAssignmentsForMentor } from "@/lib/db/queries/weeklyReports";
import {
  MENTOR_CALL_QUESTIONS,
  MENTOR_CALL_SECTIONS,
  MENTOR_GUIDANCE,
} from "@/lib/mentor/callQuestions";
import { LogCallForm } from "./_components/LogCallForm";

export const metadata: Metadata = {
  title: "Collect a report",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewMentorCallPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  await requireRole("mentor");
  const me = await getCurrentDbUser();
  const { student: studentParam } = await searchParams;

  const assignedSlugs = me ? await getAssignmentsForMentor(me.id) : [];
  const allStudents = await getAllStudents();
  const labelFor = (slug: string) => {
    const match = allStudents.find((s) => s.id === slug);
    return match?.displayName ? `${match.displayName} (${slug})` : slug;
  };
  const studentOptions = assignedSlugs.map((slug) => ({ slug, label: labelFor(slug) }));

  // When opened from a student's profile (?student=slug) and the mentor is
  // assigned to them, lock the report to that one student.
  const lockedStudent =
    studentParam && assignedSlugs.includes(studentParam)
      ? { slug: studentParam, label: labelFor(studentParam) }
      : null;
  const backHref = lockedStudent
    ? `/dashboard/mentor/student/${lockedStudent.slug}`
    : "/dashboard/mentor";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Eyebrow>Mentor · Collect report</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">
          {lockedStudent ? `Report for ${lockedStudent.label}` : "Collect a report."}
        </h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Ask the questions on your call and note the answers — leave blank what doesn't apply. The
          report saves under the student's profile for the board and future mentors to see.
        </p>
      </header>

      {studentOptions.length === 0 ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-body-sm text-ink-2">
          You're not assigned any students yet. An admin assigns students via{" "}
          <strong>/dashboard/admin/mentors</strong>.
        </p>
      ) : (
        <div className="max-w-[720px]">
          <LogCallForm
            studentOptions={studentOptions}
            lockedStudent={lockedStudent}
            questions={MENTOR_CALL_QUESTIONS}
            sections={MENTOR_CALL_SECTIONS}
            guidance={MENTOR_GUIDANCE}
          />
        </div>
      )}

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        <Link
          href={backHref}
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          ← Back
        </Link>
      </p>
    </div>
  );
}
