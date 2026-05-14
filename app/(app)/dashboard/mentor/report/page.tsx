import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireRole } from "@/lib/auth";
import { WeeklyReportForm } from "./_components/WeeklyReportForm";

export const metadata: Metadata = {
  title: "File weekly report",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = { student?: string };

export default async function FileWeeklyReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole("mentor");
  const { student } = await searchParams;
  const studentSlug = student ?? "";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb">
          <Link
            href="/dashboard/mentor"
            className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
          >
            ← Mentor dashboard
          </Link>
        </nav>
        <Eyebrow>Weekly report</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">
          {studentSlug ? `Report for ${studentSlug.replace(/-/g, " ")}` : "File a weekly report"}
        </h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Two minutes max. Attendance, study notes, anything the board should know. Files attached
          here are stored in Vercel Blob once the integration lands.
        </p>
      </header>

      <WeeklyReportForm studentSlug={studentSlug} />
    </div>
  );
}
