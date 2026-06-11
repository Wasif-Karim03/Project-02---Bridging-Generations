import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { JsonLd } from "@/components/seo/JsonLd";
import { StudentPlaceholder } from "@/components/ui/StudentPlaceholder";
import { canShowPortrait, canShowStory } from "@/lib/content/canShowPortrait";
import { getSchoolById } from "@/lib/content/schools";
import {
  type ApprovedStudentDetail,
  getApprovedStudentDetail,
  getStudentBySlug,
} from "@/lib/content/students";
import { getStudentGrowthData } from "@/lib/db/queries/studentGrowth";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { StudentGrowthButton } from "./_components/StudentGrowthButton";

type Params = { slug: string };

// Rendered on demand: profiles now include approved DB applicants (auto-
// published) whose data is live, so we can't bake these pages at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const student = await getStudentBySlug(slug);
  if (!student) return { title: "Student" };
  return {
    title: `${student.displayName} — Sponsored student`,
    description: `${student.displayName} is in grade ${student.grade} at a Bridging Generations partner school. First names only; portraits appear only with a written family release on file.`,
    robots: { index: false, follow: true },
  };
}

export default async function StudentProfilePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  // Approved DB applicants get the full, data-rich profile built from their
  // application. Keystatic students fall through to the curated layout below.
  const approved = await getApprovedStudentDetail(slug);
  if (approved) {
    return <ApprovedStudentProfile detail={approved} slug={slug} />;
  }
  const student = await getStudentBySlug(slug);
  if (!student) {
    notFound();
  }

  const [school, growthData] = await Promise.all([
    student.schoolId ? getSchoolById(student.schoolId) : Promise.resolve(null),
    getStudentGrowthData(slug),
  ]);
  const portraitSrc = student.portrait?.src ?? null;
  const allowPortrait = canShowPortrait(student.consent) && Boolean(portraitSrc);
  const allowBio = canShowStory(student.consent) && Boolean(student.bio?.trim());
  const sponsorshipLabel =
    student.sponsorshipStatus === "sponsored" ? "Sponsored" : "Awaiting a sponsor";

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Students", url: "/students" },
    { name: student.displayName, url: `/students/${student.id}` },
  ]);

  return (
    <main className="bg-ground">
      <article className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/students"
            className="text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-accent-2-text focus-visible:text-accent-2-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
          >
            ← Back to directory
          </Link>
        </nav>

        <header className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:items-end lg:gap-14">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-3">
            {allowPortrait && portraitSrc ? (
              <Image
                src={portraitSrc}
                alt={student.portrait?.alt ?? ""}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                priority
                fetchPriority="high"
              />
            ) : (
              <StudentPlaceholder sizes="(min-width: 1024px) 40vw, 100vw" />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-meta uppercase tracking-[0.12em] text-ink-2">{sponsorshipLabel}</p>
            <h1 className="text-balance text-display-2 text-ink">{student.displayName}</h1>
            <dl className="flex flex-col gap-2 border-t border-hairline pt-4 text-body text-ink-2">
              <Row label="Grade" value={String(student.grade)} />
              {school ? (
                <Row
                  label="School"
                  value={
                    <Link
                      href={`/schools/${school.id}`}
                      className="text-ink underline underline-offset-[3px] transition hover:text-accent hover:no-underline"
                    >
                      {school.name}
                    </Link>
                  }
                />
              ) : null}
              {student.community ? (
                <Row
                  label="Community"
                  value={<span className="capitalize">{student.community}</span>}
                />
              ) : null}
              {student.region ? <Row label="Region" value={student.region} /> : null}
              {student.area ? <Row label="Area" value={student.area} /> : null}
              {student.village ? <Row label="Village" value={student.village} /> : null}
              {student.hobby ? <Row label="Hobby" value={student.hobby} /> : null}
              {student.gpa ? <Row label="GPA" value={student.gpa} /> : null}
              {student.lifeTarget ? <Row label="Life target" value={student.lifeTarget} /> : null}
              {student.registrationCode ? (
                <Row
                  label="Registration code"
                  value={<span className="font-mono">{student.registrationCode}</span>}
                />
              ) : null}
            </dl>
            {student.fundingNeed ? (
              <div className="mt-2 border border-accent-2-text/30 bg-accent-2-text/[0.06] p-4">
                <p className="text-eyebrow uppercase tracking-[0.1em] text-accent-2-text">
                  Funding need
                </p>
                <p className="mt-1 text-heading-2 tabular-nums text-ink">
                  <span className="text-accent-2-text">{student.fundingNeed.fundedLabel}</span> of{" "}
                  {student.fundingNeed.requiredLabel} USD
                </p>
                <div
                  className="mt-2 h-2 w-full overflow-hidden bg-ground-3"
                  role="progressbar"
                  aria-valuenow={student.fundingNeed.progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-accent-2-text"
                    style={{ width: `${Math.max(student.fundingNeed.progressPct, 2)}%` }}
                  />
                </div>
                <p className="mt-2 text-body-sm text-ink-2">
                  {student.fundingNeed.byInstallments
                    ? `By installments${
                        student.fundingNeed.perInstallmentLabel
                          ? ` · ${student.fundingNeed.perInstallmentLabel} USD per installment`
                          : ""
                      }${student.fundingNeed.duration ? ` over ${student.fundingNeed.duration}` : ""}`
                    : "One-time support"}
                </p>
                {student.fundingNeed.purpose ? (
                  <p className="mt-1 text-body-sm text-ink-2">For: {student.fundingNeed.purpose}</p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/donate/start?student=${slug}`}
                className="inline-flex min-h-[48px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
              >
                Be a Donor
              </Link>
              <Link
                href="/students"
                className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
              >
                Browse all students
              </Link>
              <StudentGrowthButton data={growthData} studentName={student.displayName} />
            </div>
          </div>
        </header>

        <section
          aria-label={`About ${student.displayName}`}
          className="mt-16 border-t border-hairline pt-12 lg:mt-24"
        >
          {allowBio ? (
            <div className="max-w-[60ch] whitespace-pre-line text-body-lg text-ink">
              {student.bio}
            </div>
          ) : (
            <p className="max-w-[60ch] text-body-lg text-ink-2">
              {student.displayName} hasn't shared a story yet — first-name-only listings stay
              private until the family is comfortable saying more.
            </p>
          )}
          {student.quote ? (
            <p className="mt-8 max-w-[44ch] text-balance text-heading-3 text-ink">
              &ldquo;{student.quote}&rdquo;
            </p>
          ) : null}
        </section>
      </article>
      <JsonLd id="ld-student-breadcrumb" data={ldBreadcrumb} />
    </main>
  );
}

// Full data-rich profile for an approved DB student — shows everything we
// collected on the application, plus a donations table.
function ApprovedStudentProfile({ detail, slug }: { detail: ApprovedStudentDetail; slug: string }) {
  const f = detail.funding;
  return (
    <main className="bg-ground">
      <article className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-[6%] lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/students"
            className="text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-accent-2-text"
          >
            ← Back to directory
          </Link>
        </nav>

        <p className="text-meta uppercase tracking-[0.12em] text-ink-2">
          You are going to support for
        </p>
        <h1 className="mt-1 text-balance text-display-2 text-ink">{detail.fullName}</h1>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-hairline bg-ground-3">
            {detail.photoSrc ? (
              <Image
                src={detail.photoSrc}
                alt={`${detail.fullName} portrait`}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <StudentPlaceholder sizes="(min-width: 1024px) 40vw, 100vw" />
            )}
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-heading-3 text-ink">
              {detail.fullName}
              {detail.registrationNo ? (
                <span className="text-ink-2"> (REG NO: {detail.registrationNo})</span>
              ) : null}
            </h2>

            {f ? (
              <div className="flex flex-col gap-2">
                <p className="text-heading-2 tabular-nums text-ink">
                  <span className="text-accent-2-text">{f.fundedLabel}</span> funded of{" "}
                  {f.requiredLabel} USD
                </p>
                <div
                  className="h-2 w-full overflow-hidden bg-ground-3"
                  role="progressbar"
                  aria-valuenow={f.progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-accent-2-text"
                    style={{ width: `${Math.max(f.progressPct, 2)}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/donate/start?student=${slug}`}
                className="inline-flex min-h-[48px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
              >
                Sponsor this student
              </Link>
              <Link
                href="/students"
                className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
              >
                Browse all students
              </Link>
            </div>
          </div>
        </div>

        <section
          aria-label="Student details"
          className="mt-16 border-t border-hairline pt-10 lg:mt-20"
        >
          <h2 className="text-heading-3 text-ink">Student Details</h2>
          <dl className="mt-6 grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2">
            {detail.details.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 border-b border-hairline py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="shrink-0 text-meta uppercase tracking-[0.06em] text-ink-2">
                  {label}
                </dt>
                <dd className="text-body text-ink sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Donations" className="mt-12 border-t border-hairline pt-10">
          <h2 className="text-heading-3 text-ink">Donators for {detail.firstName}</h2>
          <p className="mt-4 max-w-[60ch] text-body text-ink-2">
            No donations have been recorded for {detail.firstName} yet. Be the first to sponsor —
            once online giving is live, each gift will appear here with the donor's name, amount,
            and year.
          </p>
        </section>
      </article>
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-meta uppercase tracking-[0.08em]">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
