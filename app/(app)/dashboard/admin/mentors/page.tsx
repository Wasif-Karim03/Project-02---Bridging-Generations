import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllStudents, getApprovedPublicStudents } from "@/lib/content/students";
import { listAllMentors } from "@/lib/db/queries/users";
import { getAssignmentsForMentor } from "@/lib/db/queries/weeklyReports";
import { donorCodeForUuid } from "@/lib/donor/donorCode";

export const metadata: Metadata = {
  title: "Mentors (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMentorsPage() {
  // Role check enforced by the parent admin layout.
  const dbReady = isDbConfigured();
  const mentors = await listAllMentors();

  // Resolve each mentor's assigned students to names so the admin sees the full
  // mentor → students map at a glance. Student names come from Keystatic + the
  // approved DB applicants (same set assignable on the mentor detail page).
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
        <h1 className="text-balance text-heading-1 text-ink">Mentors.</h1>
        <p className="max-w-[65ch] text-body text-ink-2">
          Who mentors whom, at a glance. Each card shows a mentor and the students assigned to them.
          Click a mentor to add or remove assignments, view their weekly reports, or edit their bio.
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — no mentor list available until Neon Postgres is provisioned.
        </p>
      ) : null}

      {mentors.length === 0 ? (
        <p className="text-body text-ink-2">
          No mentors yet.{" "}
          {dbReady ? (
            <>
              Promote an approved applicant to <code>mentor</code> from{" "}
              <Link
                href="/dashboard/admin/users"
                className="text-accent underline underline-offset-[3px] hover:no-underline"
              >
                /dashboard/admin/users
              </Link>
              .
            </>
          ) : (
            "Provision DATABASE_URL to enable role management."
          )}
        </p>
      ) : (
        <>
          <p className="text-meta uppercase tracking-[0.08em] text-ink-2">
            {mentors.length} {mentors.length === 1 ? "mentor" : "mentors"} · {totalAssigned}{" "}
            {totalAssigned === 1 ? "assignment" : "assignments"}
          </p>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {rows.map(({ mentor: m, students }) => (
              <li
                key={m.id}
                className="flex flex-col gap-3 border border-hairline bg-ground-2 p-5"
              >
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
                  <ul className="flex flex-wrap gap-2">
                    {students.map((s) => (
                      <li
                        key={s.slug}
                        className="inline-flex items-center border border-hairline bg-ground px-3 py-1.5 text-body-sm text-ink"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
