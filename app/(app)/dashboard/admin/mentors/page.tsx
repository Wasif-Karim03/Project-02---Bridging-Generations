import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { listAllMentors } from "@/lib/db/queries/users";
import { getAssignmentsForMentor } from "@/lib/db/queries/weeklyReports";
import { donorCodeForUuid } from "@/lib/donor/donorCode";

export const metadata: Metadata = {
  title: "Mentors (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminMentorsPage() {
  // Role check enforced by the parent admin layout.
  const dbReady = isDbConfigured();
  const mentors = await listAllMentors();
  // Hydrate each mentor with their current assignment count. Sequential
  // per-mentor lookups are fine at this scale (org has under 50 mentors).
  const assignmentCounts = await Promise.all(
    mentors.map((m) => getAssignmentsForMentor(m.id).then((a) => a.length)),
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Mentors.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Everyone currently holding the <code>mentor</code> role. Click a row to manage their
          student assignments, view their weekly reports, or edit their bio.
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="py-3 pr-4 text-left">Mentor</th>
                <th className="py-3 pr-4 text-left">Email</th>
                <th className="py-3 pr-4 text-left">ID</th>
                <th className="py-3 pr-4 text-left">Since</th>
                <th className="py-3 text-right">Students</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((m, i) => (
                <tr key={m.id} className="border-b border-hairline last:border-b-0">
                  <td className="py-3 pr-4 align-top text-ink">
                    <Link
                      href={`/dashboard/admin/mentors/${m.id}`}
                      className="text-accent underline underline-offset-[3px] hover:no-underline"
                    >
                      {m.displayName ?? m.email}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 align-top text-ink-2">{m.email}</td>
                  <td className="py-3 pr-4 align-top font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
                    {donorCodeForUuid(m.id).replace("BG-", "MEN-")}
                  </td>
                  <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                    <time dateTime={m.createdAt.toISOString()}>
                      {dateFormatter.format(m.createdAt)}
                    </time>
                  </td>
                  <td className="py-3 text-right align-top tabular-nums text-ink">
                    {assignmentCounts[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
