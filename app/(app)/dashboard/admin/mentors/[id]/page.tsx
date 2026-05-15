import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllStudents } from "@/lib/content/students";
import { getUserById } from "@/lib/db/queries/users";
import { getAssignmentsForMentor, getRecentReportsForMentor } from "@/lib/db/queries/weeklyReports";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { MentorAssignmentEditor } from "./_components/MentorAssignmentEditor";

export const metadata: Metadata = {
  title: "Mentor detail (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminMentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbReady = isDbConfigured();

  if (!dbReady) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/dashboard/admin/mentors"
          className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
        >
          ← Mentors
        </Link>
        <h1 className="text-heading-2 text-ink">Mentor detail</h1>
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-body text-ink-2">
          The mentor detail page reads from Postgres. Provision Neon and set DATABASE_URL.
        </p>
      </div>
    );
  }

  const [user, assignedSlugs, allStudents, recentReports] = await Promise.all([
    getUserById(id),
    getAssignmentsForMentor(id),
    getAllStudents(),
    getRecentReportsForMentor(id, 10),
  ]);
  if (!user) notFound();
  const studentBySlug = new Map(allStudents.map((s) => [s.id, s]));
  const mentorCode = donorCodeForUuid(user.id).replace("BG-", "MEN-");

  // Build the dropdown options for unassigned students.
  const unassignedStudents = allStudents.filter((s) => !assignedSlugs.includes(s.id));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/admin/mentors"
          className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
        >
          ← Mentors
        </Link>
        <h1 className="text-balance text-heading-1 text-ink">{user.displayName ?? user.email}</h1>
        <p className="font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
          {mentorCode} · {user.role}
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Email" value={user.email} />
        <Stat label="Joined" value={dateFormatter.format(user.createdAt)} />
        <Stat label="Active students" value={String(assignedSlugs.length)} />
      </section>

      <section aria-labelledby="assignments-title" className="flex flex-col gap-4">
        <header className="border-b border-hairline pb-3">
          <h2 id="assignments-title" className="text-heading-3 text-ink">
            Student assignments
          </h2>
          <p className="mt-1 text-body-sm text-ink-2">
            Pair this mentor with the students they'll guide. The mentor sees their assigned
            students on /dashboard/mentor and files weekly reports for each.
          </p>
        </header>
        <MentorAssignmentEditor
          mentorUserId={user.id}
          assignedSlugs={assignedSlugs}
          unassignedOptions={unassignedStudents.map((s) => ({
            slug: s.id,
            label: s.displayName ?? s.id,
          }))}
          studentBySlug={Object.fromEntries(
            assignedSlugs.map((slug) => [slug, studentBySlug.get(slug)?.displayName ?? slug]),
          )}
        />
      </section>

      <section aria-labelledby="reports-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="reports-title" className="text-heading-3 text-ink">
            Recent weekly reports
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {recentReports.length} {recentReports.length === 1 ? "report" : "reports"}
          </span>
        </header>
        {recentReports.length === 0 ? (
          <p className="text-body text-ink-2">No reports filed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Week of</th>
                  <th className="py-3 pr-4 text-left">Student</th>
                  <th className="py-3 pr-4 text-left">Attendance</th>
                  <th className="py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-ink">
                      <time dateTime={r.weekOf.toISOString()}>
                        {dateFormatter.format(r.weekOf)}
                      </time>
                    </td>
                    <td className="py-3 pr-4 align-top text-ink">
                      {studentBySlug.get(r.studentSlug)?.displayName ?? r.studentSlug}
                    </td>
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      {r.attendance ?? "—"}
                    </td>
                    <td className="py-3 align-top text-body-sm text-ink-2">
                      {r.studyNotes?.slice(0, 140) ?? "—"}
                      {r.studyNotes && r.studyNotes.length > 140 ? "…" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline bg-ground-2 p-4">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 break-words text-body text-ink">{value}</p>
    </div>
  );
}
