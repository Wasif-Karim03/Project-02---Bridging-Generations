import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllStudents } from "@/lib/content/students";
import { listAllStudentUsers } from "@/lib/db/queries/users";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { StudentSlugLink } from "./_components/StudentSlugLink";

export const metadata: Metadata = {
  title: "Students (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminStudentsPage() {
  // Role check enforced by parent admin layout.
  const dbReady = isDbConfigured();
  const [studentUsers, allKeystaticStudents] = await Promise.all([
    listAllStudentUsers(),
    getAllStudents(),
  ]);
  const slugOptions = allKeystaticStudents.map((s) => ({
    slug: s.id,
    label: s.displayName ?? s.id,
  }));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Students.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Everyone with a student account. To activate a student's dashboard so they can see their
          sponsors, link their account to a Keystatic student record using the dropdown on the
          right. Until you link, the student sees "Application under review."
        </p>
      </header>

      {!dbReady ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — no student accounts to manage until Neon Postgres is provisioned.
        </p>
      ) : null}

      {studentUsers.length === 0 ? (
        <p className="text-body text-ink-2">
          No student accounts yet. Students apply at{" "}
          <Link
            href="/student-signup"
            className="text-accent underline underline-offset-[3px] hover:no-underline"
          >
            /student-signup
          </Link>{" "}
          — they appear here once they finish the signup form.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="py-3 pr-4 text-left">Account</th>
                <th className="py-3 pr-4 text-left">Email</th>
                <th className="py-3 pr-4 text-left">Joined</th>
                <th className="py-3 text-left">Link to Keystatic student</th>
              </tr>
            </thead>
            <tbody>
              {studentUsers.map((u) => (
                <tr key={u.id} className="border-b border-hairline last:border-b-0">
                  <td className="py-3 pr-4 align-top text-ink">
                    <div className="font-semibold">{u.displayName ?? u.email}</div>
                    <div className="font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
                      {donorCodeForUuid(u.id).replace("BG-", "STU-")}
                    </div>
                  </td>
                  <td className="py-3 pr-4 align-top text-ink-2">{u.email}</td>
                  <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                    <time dateTime={u.createdAt.toISOString()}>
                      {dateFormatter.format(u.createdAt)}
                    </time>
                  </td>
                  <td className="py-3 align-top">
                    <StudentSlugLink
                      userId={u.id}
                      currentSlug={u.studentSlug}
                      slugOptions={slugOptions}
                    />
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
