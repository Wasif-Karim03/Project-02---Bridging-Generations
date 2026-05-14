import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { MDXRenderer } from "@/components/content/MDXRenderer";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { TeacherPanel } from "@/components/domain/TeacherPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import { getAllSchools, getSchoolById } from "@/lib/content/schools";
import { getAllStudents } from "@/lib/content/students";
import { getAllTeachers } from "@/lib/content/teachers";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const schools = await getAllSchools();
  return schools.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolById(slug);
  if (!school) return { title: "School" };
  return {
    title: school.name,
    description:
      school.description ||
      `${school.name} is a Bridging Generations partner school in ${school.location}.`,
  };
}

export default async function SchoolDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const school = await getSchoolById(slug);
  if (!school) notFound();

  const [allStudents, allTeachers, allSchools] = await Promise.all([
    getAllStudents(),
    getAllTeachers(),
    getAllSchools(),
  ]);

  const studentsHere = allStudents.filter((s) => s.schoolId === school.id);
  const teachersHere = allTeachers.filter((t) => t.schoolId === school.id);
  const overviewBody = school.overview ? await school.overview() : "";
  const studentCount =
    school.studentCountOverride && school.studentCountOverride > 0
      ? school.studentCountOverride
      : studentsHere.length;

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
    { name: school.name, url: `/schools/${school.id}` },
  ]);

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="school-hero-title"
        className="scroll-mt-20 overflow-x-clip bg-ground-3 px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <nav aria-label="Breadcrumb">
              <Link
                href="/projects"
                className="text-meta uppercase tracking-[0.08em] text-ink-2 transition hover:text-accent"
              >
                ← Projects
              </Link>
            </nav>
            <Eyebrow>School</Eyebrow>
            <h1
              id="school-hero-title"
              className="max-w-[22ch] text-balance text-display-2 text-ink"
            >
              {school.name}
            </h1>
            <dl className="flex flex-col gap-2 text-body text-ink-2">
              <div className="flex gap-3">
                <dt className="text-meta uppercase tracking-[0.08em] text-ink-2">Location</dt>
                <dd className="text-ink">{school.location}</dd>
              </div>
              {school.establishedYear ? (
                <div className="flex gap-3">
                  <dt className="text-meta uppercase tracking-[0.08em] text-ink-2">Established</dt>
                  <dd className="text-ink">{school.establishedYear}</dd>
                </div>
              ) : null}
              <div className="flex gap-3">
                <dt className="text-meta uppercase tracking-[0.08em] text-ink-2">Students</dt>
                <dd className="text-ink">{studentCount}</dd>
              </div>
            </dl>
            {school.description ? (
              <p className="max-w-[60ch] text-body-lg text-ink-2">{school.description}</p>
            ) : null}
          </div>
          {school.heroImage?.src ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2">
              <Image
                src={school.heroImage.src}
                alt={school.heroImage.alt || school.name}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {overviewBody ? (
        <section
          aria-labelledby="overview-title"
          className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
        >
          <div className="mx-auto max-w-[840px]">
            <Eyebrow>Overview</Eyebrow>
            <h2 id="overview-title" className="mt-3 text-balance text-heading-1 text-ink">
              About this school.
            </h2>
            <div className="mt-8">
              <MDXRenderer source={overviewBody} />
            </div>
          </div>
        </section>
      ) : null}

      {teachersHere.length > 0 ? (
        <TeacherPanel
          eyebrow="Teachers"
          headline={`Teachers at ${school.name}.`}
          teachers={teachersHere}
          schools={allSchools}
        />
      ) : null}

      {studentsHere.length > 0 ? (
        <section
          aria-labelledby="school-students-title"
          className="bg-ground-2 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
        >
          <div className="mx-auto max-w-[1280px]">
            <Eyebrow>Students</Eyebrow>
            <h2
              id="school-students-title"
              className="mt-2 max-w-[36ch] text-balance text-heading-2 text-ink"
            >
              Students sponsored at {school.name}.
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {studentsHere.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/students/${s.id}`}
                    className="group/link flex flex-col gap-1 border-t border-hairline pt-3 text-ink transition hover:text-accent"
                  >
                    <span className="text-heading-5">{s.displayName}</span>
                    <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
                      Grade {s.grade}
                      {" · "}
                      {s.sponsorshipStatus === "sponsored" ? "sponsored" : "awaiting sponsor"}
                      {!canShowPortrait(s.consent) ? " · placeholder portrait" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CTAFooterPanel
        headline={`Sponsor a student at ${school.name}.`}
        body="Every $30 / month sponsorship covers tuition, books, meals, and materials for one student here."
        ctaLabel="Sponsor a Student"
        ctaHref="/donate"
        tone="teal"
        titleId="school-cta-title"
      />
      <JsonLd id="ld-school-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
