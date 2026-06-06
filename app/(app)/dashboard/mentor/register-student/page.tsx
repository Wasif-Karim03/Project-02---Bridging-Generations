import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { StudentApplicationForm } from "@/app/student-signup/details/_components/StudentApplicationForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireRole } from "@/lib/auth";
import { mentorRegisterStudentAction } from "./actions";

export const metadata: Metadata = {
  title: "Register a student",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MentorRegisterStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireRole("mentor");
  const { ok } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Breadcrumb">
        <Link
          href="/dashboard/mentor"
          className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
        >
          ← Back to dashboard
        </Link>
      </nav>

      <header className="flex flex-col gap-2 border-b border-hairline pb-5">
        <Eyebrow>Mentor · Register a student</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Register a student.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Fill in the student's details on their behalf — the same form a student fills out, but no
          account is created. Once you submit, the board reviews it and, on approval, the student
          appears on the public site just like any other.
        </p>
      </header>

      {ok ? (
        <p
          role="status"
          className="border border-accent bg-accent/10 px-4 py-3 text-body-sm text-ink"
        >
          ✓ Student registered. The board will review the application. You can register another
          below.
        </p>
      ) : null}

      <StudentApplicationForm
        action={mentorRegisterStudentAction}
        submitLabel="Register student (শিক্ষার্থী নিবন্ধন করুন)"
      />
    </div>
  );
}
