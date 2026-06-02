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
  title: "Log a mentor call",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewMentorCallPage() {
  await requireRole("mentor");
  const me = await getCurrentDbUser();

  const assignedSlugs = me ? await getAssignmentsForMentor(me.id) : [];
  const allStudents = await getAllStudents();
  const studentOptions = assignedSlugs.map((slug) => {
    const match = allStudents.find((s) => s.id === slug);
    return { slug, label: match?.displayName ? `${match.displayName} (${slug})` : slug };
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Eyebrow>Mentor · New call</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Log a call.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Fill in what you can — leave blank what doesn't apply. The next-call date is auto-set 15
          days from the call date as a guideline.
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
            questions={MENTOR_CALL_QUESTIONS}
            sections={MENTOR_CALL_SECTIONS}
            guidance={MENTOR_GUIDANCE}
          />
        </div>
      )}

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        <Link
          href="/dashboard/mentor"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          ← Back to mentor dashboard
        </Link>
      </p>
    </div>
  );
}
