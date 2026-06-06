import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllStudents, getApprovedPublicStudents } from "@/lib/content/students";
import { listAllMentors } from "@/lib/db/queries/users";
import { getAssignmentsForMentor } from "@/lib/db/queries/weeklyReports";
import { donorCodeForUuid } from "@/lib/donor/donorCode";

export const metadata: Metadata = {
  title: "Map (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Mentor → students map. One card per mentor showing the students assigned to
// them, so the admin sees who mentors whom at a glance.
export default async function AdminMapPage() {
  // Role check enforced by the parent admin layout.
  const dbReady = isDbConfigured();
  const mentors = await listAllMentors();

  const [assignmentsPerMentor, keystaticStudents, dbStudents] = await Promise.all([
    Promise.all(mentors.map((m) => getAssignmentsForMentor(m.id))),
    getAllStudents(),
    getApprovedPublicStudents(),
  ]);
  const nameBySlug = new Map<string, string>();
  for (const s of [...keystaticStudents, ...dbStudents]) {
    nameBySlug.set(s.id, s.displayName ?? s.id);
  }
  const rows = mentors.map((m, i) => ({
    mentor: m,
    students: assignmentsPerMentor[i].map((slug) => ({
      slug,
      name: nameBySlug.get(slug) ?? slug,
    })),
  }));
  const totalAssigned = rows.reduce((sum, r) => sum + r.students.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Map.</h1>
        <p className="max-w-[65ch] text-body text-ink-2">
          Who mentors whom, at a glance. Each card is a mentor and the students assigned to them.
          Click a mentor to add or remove assignments.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — the map needs Neon Postgres provisioned.
        </p>
      ) : mentors.length === 0 ? (
        <p className="text-body text-ink-2">
          No mentors yet. Approve a mentor application, then assign students to them.
        </p>
      ) : (
        <>
          <p className="text-meta uppercase tracking-[0.08em] text-ink-2">
            {mentors.length} {mentors.length === 1 ? "mentor" : "mentors"} · {totalAssigned}{" "}
            {totalAssigned === 1 ? "student assigned" : "students assigned"}
          </p>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {rows.map(({ mentor: m, students }) => (
              <li key={m.id} className="flex flex-col gap-3 border border-hairline bg-ground-2 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hairline pb-3">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/admin/mentors/${m.id}`}
                      className="text-heading-5 text-accent underline underline-offset-[3px] hover:no-underline"
                    >
                      {m.displayName ?? m.email}
                    </Link>
                    <span className="font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
                      {donorCodeForUuid(m.id).replace("BG-", "MEN-")} · {m.email}
                    </span>
                  </div>
                  <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
                    {students.length} {students.length === 1 ? "student" : "students"}
                  </span>
                </div>

                {students.length === 0 ? (
                  <p className="text-body-sm text-ink-2">
                    No students assigned yet —{" "}
                    <Link
                      href={`/dashboard/admin/mentors/${m.id}`}
                      className="text-accent underline underline-offset-[3px] hover:no-underline"
                    >
                      assign some
                    </Link>
                    .
                  </p>
                ) : (
                  <ol className="flex flex-col gap-1.5">
                    {students.map((s, idx) => (
                      <li key={s.slug} className="flex items-baseline gap-2 text-body text-ink">
                        <span className="w-5 shrink-0 text-meta tabular-nums text-ink-2">
                          {idx + 1}.
                        </span>
                        <Link
                          href={`/students/${s.slug}`}
                          className="text-ink underline underline-offset-[3px] transition-colors hover:text-accent hover:no-underline"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
