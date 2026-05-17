import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllStudents } from "@/lib/content/students";
import { getLatestStudentRegistrationForUser } from "@/lib/db/queries/applications";
import { listAllStudentUsers } from "@/lib/db/queries/users";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { StudentRejectControl } from "./_components/StudentRejectControl";
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

  // Hydrate the latest registration per student so we can show approve /
  // pending / rejected at-a-glance and gate the controls correctly. Sequential
  // per-student lookups are fine at the org's scale (< few hundred students).
  const registrations = await Promise.all(
    studentUsers.map((u) => getLatestStudentRegistrationForUser(u.id)),
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-heading-1 text-ink">Students.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Everyone with a student account. <strong>Approve</strong> by linking their account to a
          Keystatic student record (dropdown on the right); <strong>reject</strong> via the Reject
          button. Both decisions email the student. A student stays in the "Application under
          review" state until you do one of the two.
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
                <th className="py-3 pr-4 text-left">Status</th>
                <th className="py-3 text-left">Decision</th>
              </tr>
            </thead>
            <tbody>
              {studentUsers.map((u, i) => {
                const reg = registrations[i];
                const isLinked = Boolean(u.studentSlug);
                const isRejected = reg?.status === "rejected";
                const studentName = reg?.studentName ?? u.displayName ?? u.email;
                return (
                  <tr key={u.id} className="border-b border-hairline align-top last:border-b-0">
                    <td className="py-3 pr-4 text-ink">
                      <div className="font-semibold">{u.displayName ?? u.email}</div>
                      <div className="font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
                        {donorCodeForUuid(u.id).replace("BG-", "STU-")}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink-2">{u.email}</td>
                    <td className="py-3 pr-4 text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={u.createdAt.toISOString()}>
                        {dateFormatter.format(u.createdAt)}
                      </time>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge
                        isLinked={isLinked}
                        isRejected={isRejected}
                        hasRegistration={Boolean(reg)}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-3">
                        <StudentSlugLink
                          userId={u.id}
                          currentSlug={u.studentSlug}
                          slugOptions={slugOptions}
                        />
                        {!isLinked && !isRejected && reg ? (
                          <StudentRejectControl userId={u.id} studentName={studentName} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  isLinked,
  isRejected,
  hasRegistration,
}: {
  isLinked: boolean;
  isRejected: boolean;
  hasRegistration: boolean;
}) {
  if (isLinked) {
    return (
      <span className="inline-block bg-accent px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-white">
        Approved
      </span>
    );
  }
  if (isRejected) {
    return (
      <span className="inline-block bg-accent-2-text px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-white">
        Rejected
      </span>
    );
  }
  if (!hasRegistration) {
    return (
      <span className="inline-block border border-hairline px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-ink-2">
        No application
      </span>
    );
  }
  return (
    <span className="inline-block bg-accent-3 px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-ink">
      Pending review
    </span>
  );
}
