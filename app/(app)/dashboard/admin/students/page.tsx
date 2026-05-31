import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Fragment } from "react";
import { isDbConfigured } from "@/db/client";
import type { studentRegistrations } from "@/db/schema";
import { getAllStudents } from "@/lib/content/students";
import { getLatestStudentRegistrationForUser } from "@/lib/db/queries/applications";
import { listAllStudentUsers } from "@/lib/db/queries/users";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { StudentRejectControl } from "./_components/StudentRejectControl";
import { StudentSlugLink } from "./_components/StudentSlugLink";

type StudentRegistration = typeof studentRegistrations.$inferSelect;

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
                const isApproved = reg?.status === "approved";
                const studentName = reg?.studentName ?? u.displayName ?? u.email;
                return (
                  <Fragment key={u.id}>
                    <tr className="border-b border-hairline align-top last:border-b-0">
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
                          isApproved={isApproved}
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
                    {reg ? (
                      <tr className="border-b border-hairline last:border-b-0">
                        <td colSpan={5} className="pb-4">
                          <StudentApplicationDetails reg={reg} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
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
  isApproved,
  isRejected,
  hasRegistration,
}: {
  isLinked: boolean;
  isApproved: boolean;
  isRejected: boolean;
  hasRegistration: boolean;
}) {
  // Linked = approved AND has a public profile; approved = the board's decision
  // even before a profile is set up. Both count as "approved" to the admin.
  if (isLinked) {
    return (
      <span className="inline-block bg-accent px-2 py-0.5 text-meta uppercase tracking-[0.06em] text-white">
        Approved · linked
      </span>
    );
  }
  if (isApproved) {
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

// Collapsible full application — every field the student submitted, grouped to
// match the application form, plus the passport photo (rendered from the
// base64 stored privately in the DB).
function StudentApplicationDetails({ reg }: { reg: StudentRegistration }) {
  const groups: Array<{ title: string; rows: Array<[string, string | null | undefined]> }> = [
    {
      title: "Student details",
      rows: [
        ["Registration No.", reg.registrationNo],
        ["Full name", reg.studentName],
        ["Gender", reg.gender],
        ["Date of birth", reg.dateOfBirth],
        ["Ethnicity", reg.ethnicity],
        ["Orphan", reg.isOrphan ? "Yes" : "No"],
      ],
    },
    {
      title: "Parents",
      rows: [
        ["Father", reg.fatherName],
        ["Mother", reg.motherName],
        ["Contact", reg.parentsContact],
      ],
    },
    {
      title: "Address",
      rows: [
        ["Village", reg.village],
        ["Post office", reg.postOffice],
        ["Police station", reg.policeStation],
        ["District", reg.district],
      ],
    },
    {
      title: "Academic",
      rows: [
        ["Class", reg.grade],
        ["Current roll", reg.currentRollNo],
        ["Former roll", reg.formerRollNo],
        ["Total students", reg.totalStudents],
        ["School", reg.school],
      ],
    },
    {
      title: "Family & financial",
      rows: [
        ["Father's profession", reg.fatherProfession],
        ["Mother's profession", reg.motherProfession],
        ["Monthly income", reg.familyIncome],
        ["Purpose", reg.purpose],
        ["Required amount", reg.requiredAmount],
        [
          "Payment",
          reg.amountNature === "one_time"
            ? "One time"
            : reg.amountNature === "installments"
              ? "By installments"
              : null,
        ],
        ["Per installment", reg.perInstallment],
        [
          "Duration",
          reg.durationValue ? `${reg.durationValue} ${reg.durationUnit ?? ""}`.trim() : null,
        ],
      ],
    },
    {
      title: "Guardian & contact",
      rows: [
        ["Guardian", reg.guardianName],
        ["Guardian contact", reg.guardianPhone],
        ["Guardian address", reg.guardianAddress],
        ["Student phone", reg.phone],
        ["Email", reg.email],
        ["Signature", reg.studentSignature],
      ],
    },
  ];

  return (
    <details className="group border border-hairline bg-ground-2">
      <summary className="cursor-pointer list-none px-4 py-2 text-meta uppercase tracking-[0.06em] text-accent hover:bg-ground-3">
        View full application ▾
      </summary>
      <div className="flex flex-col gap-6 px-4 py-4 sm:flex-row">
        {reg.photoData ? (
          // biome-ignore lint/performance/noImgElement: admin-only private photo served from an API route; next/image needs config
          <img
            src={`/api/admin/application-photo/student-sponsorship/${reg.id}`}
            alt={`${reg.studentName} portrait`}
            className="h-40 w-32 shrink-0 rounded border border-hairline object-cover"
          />
        ) : (
          <div className="flex h-40 w-32 shrink-0 items-center justify-center rounded border border-hairline border-dashed text-center text-ink-2 text-xs">
            No photo
          </div>
        )}
        <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const rows = g.rows.filter(([, v]) => v != null && String(v).trim() !== "");
            if (rows.length === 0) return null;
            return (
              <div key={g.title}>
                <h4 className="mb-1.5 font-mono text-eyebrow uppercase tracking-[0.1em] text-ink-2">
                  {g.title}
                </h4>
                <dl className="flex flex-col gap-1 text-body-sm">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt className="shrink-0 text-ink-2">{label}:</dt>
                      <dd className="text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      </div>
      {reg.message ? (
        <div className="border-hairline border-t px-4 py-3 text-body-sm">
          <span className="text-ink-2">Comment: </span>
          <span className="text-ink">{reg.message}</span>
        </div>
      ) : null}
    </details>
  );
}
