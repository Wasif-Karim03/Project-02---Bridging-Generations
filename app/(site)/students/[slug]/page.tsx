import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { JsonLd } from "@/components/seo/JsonLd";
import { StudentPlaceholder } from "@/components/ui/StudentPlaceholder";
import { canShowPortrait, canShowStory } from "@/lib/content/canShowPortrait";
import { getSchoolById } from "@/lib/content/schools";
import { getAllStudents, getStudentBySlug } from "@/lib/content/students";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const students = await getAllStudents();
  return students.map((s) => ({ slug: s.id }));
}

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
  const student = await getStudentBySlug(slug);
  if (!student) {
    notFound();
  }

  const school = student.schoolId ? await getSchoolById(student.schoolId) : null;
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
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/donate?student=${encodeURIComponent(student.id)}`}
                className="inline-flex min-h-[48px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
              >
                Donate to {student.displayName}
              </Link>
              <Link
                href="/students"
                className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
              >
                Browse all students
              </Link>
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-meta uppercase tracking-[0.08em]">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
