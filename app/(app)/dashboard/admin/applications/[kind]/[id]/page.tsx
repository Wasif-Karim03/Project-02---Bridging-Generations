import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import type { ApplicationStatus } from "@/lib/content/applicationsMock";
import { APPLICATION_KIND_LABEL, APPLICATION_STATUS_LABEL } from "@/lib/content/applicationsMock";
import { type ApplicationDetail, getApplicationById } from "@/lib/db/queries/applications";
import { ReviewControls } from "./_components/ReviewControls";

export const metadata: Metadata = {
  title: "Application review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ALLOWED_KINDS = ["scholarship", "mentor", "student-sponsorship"] as const;
type AllowedKind = (typeof ALLOWED_KINDS)[number];
function isAllowedKind(s: string): s is AllowedKind {
  return (ALLOWED_KINDS as readonly string[]).includes(s);
}

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  // Role check enforced by parent admin layout.
  const { kind, id } = await params;
  if (!isAllowedKind(kind)) notFound();
  if (!isDbConfigured()) {
    return <PreviewModeNotice kind={kind} id={id} />;
  }
  const detail = await getApplicationById(kind, id);
  if (!detail) notFound();

  const { applicantLabel, applicantEmail, submittedAt, status, fields, photo } =
    extractDisplay(detail);
  // Every kind now has a reviewer_notes column; pull it off directly.
  const existingNotes = (detail.data as { reviewerNotes: string | null }).reviewerNotes ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/admin"
          className="text-meta uppercase tracking-[0.08em] text-accent hover:underline"
        >
          ← Back to admin overview
        </Link>
        <header className="flex flex-col gap-3 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">
              {APPLICATION_KIND_LABEL[kind]} application
            </p>
            <h1 className="text-balance text-heading-1 text-ink">{applicantLabel}</h1>
            <p className="text-body text-ink-2">
              {applicantEmail} ·{" "}
              <time dateTime={submittedAt.toISOString()}>
                {fullDateFormatter.format(submittedAt)}
              </time>
            </p>
          </div>
          <CurrentStatusBadge status={status} />
        </header>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="submission-title" className="flex flex-col gap-4">
          <h2 id="submission-title" className="text-heading-3 text-ink">
            Submission
          </h2>
          {photo ? (
            // biome-ignore lint/performance/noImgElement: private base64 photo from the DB; not a public asset
            <img
              src={`data:${photo.mime};base64,${photo.data}`}
              alt={`${applicantLabel} portrait`}
              className="h-48 w-40 rounded border border-hairline object-cover"
            />
          ) : null}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <FieldRow key={label} label={label} value={value} />
            ))}
          </dl>
        </section>

        <section aria-labelledby="review-title" className="flex flex-col gap-4">
          <h2 id="review-title" className="text-heading-3 text-ink">
            Review
          </h2>
          <ReviewControls kind={kind} id={id} currentStatus={status} initialNotes={existingNotes} />
        </section>
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-hairline pb-3">
      <dt className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</dt>
      <dd className="text-body text-ink whitespace-pre-line">{value || "—"}</dd>
    </div>
  );
}

function CurrentStatusBadge({ status }: { status: ApplicationStatus }) {
  const styleByStatus: Record<ApplicationStatus, string> = {
    submitted: "bg-accent-2 text-white",
    under_review: "bg-accent-3 text-ink",
    approved: "bg-accent text-white",
    rejected: "bg-accent-2-text text-white",
    withdrawn: "border border-hairline text-ink-2",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-meta uppercase tracking-[0.08em] ${styleByStatus[status]}`}
    >
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}

function PreviewModeNotice({ kind, id }: { kind: string; id: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/admin"
        className="text-meta uppercase tracking-[0.08em] text-accent hover:underline"
      >
        ← Back to admin overview
      </Link>
      <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
        Preview mode — application detail pages require a live database. Configure DATABASE_URL to
        enable. Requested: <code>{kind}</code>/<code>{id}</code>.
      </p>
    </div>
  );
}

/** Map a raw application row to the display payload the page renders. Each
 * field tuple is [label, value]. Empty values become "—" via FieldRow. */
function extractDisplay(detail: ApplicationDetail): {
  applicantLabel: string;
  applicantEmail: string;
  submittedAt: Date;
  status: ApplicationStatus;
  fields: Array<[string, string]>;
  photo: { data: string; mime: string } | null;
} {
  if (detail.kind === "scholarship") {
    const r = detail.data;
    return {
      applicantLabel: r.applicantName,
      applicantEmail: r.email,
      submittedAt: r.submittedAt,
      status: r.status,
      fields: [
        ["Applicant name", r.applicantName],
        ["Guardian name", r.guardianName ?? ""],
        ["Email", r.email],
        ["Phone", r.phone ?? ""],
        ["School", r.school],
        ["Grade", r.grade],
        ["Village", r.village ?? ""],
        ["Region", r.region ?? ""],
        ["Family income", r.familyIncome ?? ""],
        ["Message", r.message],
      ],
      photo: null,
    };
  }
  if (detail.kind === "mentor") {
    const r = detail.data;
    return {
      applicantLabel: r.name,
      applicantEmail: r.email,
      submittedAt: r.submittedAt,
      status: r.status,
      fields: [
        ["Name", r.name],
        ["Email", r.email],
        ["Phone", r.phone ?? ""],
        ["Address", r.address ?? ""],
        ["Country", r.country ?? ""],
        ["Profession", r.occupation ?? ""],
        ["School / college / university", r.educationStatus ?? ""],
        ["Class / year", r.classOrYear ?? ""],
        ["Grades / GPA", r.grades ?? ""],
        ["Photo link", r.photoUrl ?? ""],
        ["Subjects", r.subjects],
        ["Hours per week", r.hoursPerWeek ?? ""],
        ["When can start", r.startTerm ?? ""],
        ["Start date", r.startDate ?? ""],
        ["Expected end date", r.expectedEndDate ?? ""],
        ["Why mentor", r.whyMentor],
      ],
      photo: r.photoData ? { data: r.photoData, mime: r.photoMimeType ?? "image/jpeg" } : null,
    };
  }
  const r = detail.data;
  const duration = r.durationValue ? `${r.durationValue} ${r.durationUnit ?? ""}`.trim() : "";
  const payment =
    r.amountNature === "one_time"
      ? "One time"
      : r.amountNature === "installments"
        ? "By installments"
        : "";
  return {
    applicantLabel: r.studentName,
    applicantEmail: r.email ?? "—",
    submittedAt: r.submittedAt,
    status: r.status,
    fields: [
      ["Registration No.", r.registrationNo ?? ""],
      ["Student name", r.studentName],
      ["Gender", r.gender ?? ""],
      ["Date of birth", r.dateOfBirth ?? ""],
      ["Ethnicity", r.ethnicity ?? ""],
      ["Orphan", r.isOrphan ? "Yes" : "No"],
      ["Father's name", r.fatherName ?? ""],
      ["Mother's name", r.motherName ?? ""],
      ["Parents' contact", r.parentsContact ?? ""],
      ["Village", r.village ?? ""],
      ["Post office", r.postOffice ?? ""],
      ["Police station", r.policeStation ?? ""],
      ["District", r.district ?? ""],
      ["Class", r.grade],
      ["Current roll no.", r.currentRollNo ?? ""],
      ["Former roll no.", r.formerRollNo ?? ""],
      ["Total students", r.totalStudents ?? ""],
      ["School / institute", r.school],
      ["Father's profession", r.fatherProfession ?? ""],
      ["Mother's profession", r.motherProfession ?? ""],
      ["Family monthly income", r.familyIncome ?? ""],
      ["Purpose", r.purpose ?? ""],
      ["Required amount", r.requiredAmount ?? ""],
      ["Payment", payment],
      ["Per installment", r.perInstallment ?? ""],
      ["Duration", duration],
      ["Guardian name", r.guardianName],
      ["Guardian contact", r.guardianPhone ?? ""],
      ["Guardian address", r.guardianAddress ?? ""],
      ["Student phone", r.phone ?? ""],
      ["Email", r.email ?? ""],
      ["Signature", r.studentSignature ?? ""],
      ["Comment", r.message ?? ""],
    ],
    photo: r.photoData ? { data: r.photoData, mime: r.photoMimeType ?? "image/jpeg" } : null,
  };
}
