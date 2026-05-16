import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { RulesSection } from "@/components/content/RulesSection";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { isPlaceholder } from "@/lib/content/isPlaceholder";
import { getAllSchools, toSchoolSummary } from "@/lib/content/schools";
import { getAllStudents, getStudentsGroupedBySchool } from "@/lib/content/students";
import { getStudentsPage } from "@/lib/content/studentsPage";
import { getAllTestimonials } from "@/lib/content/testimonials";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { ConsentStatement } from "./_components/ConsentStatement";
import { SpotlightBand } from "./_components/SpotlightBand";
import { StudentDirectory } from "./_components/StudentDirectory";
import { StudentsHero } from "./_components/StudentsHero";

export const metadata: Metadata = {
  title: "Students",
  description:
    "Browse the sponsored students at Bridging Generations partner schools across the Chittagong Hill Tracts. First names only; portraits appear only with a written family release on file.",
};

// HSC = Higher Secondary Certificate (grades 11–12)
// SSC = Secondary School Certificate (grade 10)
const HSC_SSC_GRADES = new Set([10, 11, 12]);

export default async function StudentsPage() {
  const [allSchools, grouped, allStudents, testimonials, studentsPage] = await Promise.all([
    getAllSchools(),
    getStudentsGroupedBySchool(),
    getAllStudents(),
    getAllTestimonials(),
    getStudentsPage(),
  ]);

  const schools = allSchools.filter(
    (school) => !school.description || !isPlaceholder(school.description),
  );

  const pullQuote =
    testimonials.find((t) => t.speakerRole === "student") ??
    testimonials.find((t) => t.speakerRole === "parent") ??
    null;

  const knownSchoolIds = new Set(schools.map((s) => s.id));
  const visibleStudents = grouped
    .filter((g) => knownSchoolIds.has(g.schoolId))
    .flatMap((g) => g.students);
  const studentCount = visibleStudents.length;
  const schoolCount = new Set(visibleStudents.map((s) => s.schoolId)).size;
  const waitingCount = visibleStudents.filter((s) => s.sponsorshipStatus === "waiting").length;

  // Spotlight selection: explicit list if curated, else all HSC/SSC students in the visible set.
  let spotlightStudents = [] as typeof visibleStudents;
  if (studentsPage?.spotlightEnabled) {
    const curatedIds = (studentsPage.spotlightStudents ?? []).filter((id): id is string =>
      Boolean(id),
    );
    if (curatedIds.length > 0) {
      const byId = new Map(allStudents.map((s) => [s.id, s]));
      spotlightStudents = curatedIds
        .map((id) => byId.get(id))
        .filter((s): s is (typeof visibleStudents)[number] => Boolean(s));
    } else {
      spotlightStudents = visibleStudents.filter((s) => HSC_SSC_GRADES.has(s.grade));
    }
  }

  // Pre-load the rules MDX body (Keystatic mdx field exposes body as an async function).
  const rulesBody = studentsPage?.rulesBody ? await studentsPage.rulesBody() : "";

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Students", url: "/students" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/students",
    name: "Sponsored students",
    description: `Sponsored students at Bridging Generations across ${schools.length} partner schools.`,
  });

  return (
    <>
      <StudentsHero studentCount={studentCount} schoolCount={schoolCount} pullQuote={pullQuote} />
      <ConsentStatement />
      {studentsPage?.spotlightEnabled && spotlightStudents.length > 0 ? (
        <SpotlightBand
          eyebrow={studentsPage.spotlightEyebrow}
          headline={studentsPage.spotlightHeadline}
          body={studentsPage.spotlightBody}
          students={spotlightStudents}
        />
      ) : null}
      <section
        aria-label="Sponsorship status"
        className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
      >
        <div className="mx-auto max-w-[1280px] border-t border-hairline pt-12">
          <Reveal>
            <p className="max-w-[44ch] text-balance text-heading-2 text-ink">
              <span className="text-accent">{waitingCount} waiting</span> for a sponsor — every
              $30/mo sponsorship pays for the next name on this list.
            </p>
          </Reveal>
        </div>
      </section>
      <StudentDirectory students={visibleStudents} schools={schools.map(toSchoolSummary)} />
      <RulesSection
        id="rules"
        eyebrow="Scholarship rules"
        title="What sponsorship requires of our students."
        intro={studentsPage?.rulesIntro}
        body={rulesBody}
      />
      <section aria-label="Apply" className="bg-ground-3 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-eyebrow uppercase text-accent">Apply</p>
            <h2 className="mt-2 max-w-[36ch] text-balance text-heading-3 text-ink">
              Are you a student? Apply for a scholarship.
            </h2>
            <p className="mt-2 max-w-[48ch] text-body-sm text-ink-2">
              Create a free student account, share your details, and our board will review your
              application. Once approved, you'll get a unique Student ID and can sign in to see who
              is sponsoring you and how much they've given.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/student-signup"
              className="inline-flex min-h-[48px] items-center bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
            >
              Apply as a student →
            </Link>
            <Link
              href="/student-login"
              className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/mentor-login"
              className="inline-flex min-h-[48px] items-center border border-hairline px-5 text-nav-link uppercase text-ink hover:border-accent hover:text-accent"
            >
              Apply as mentor
            </Link>
          </div>
        </div>
      </section>
      <CTAFooterPanel
        headline="Your sponsorship puts a name on this page."
        body="Every $30 / month sponsorship covers tuition, books, daily meals, and materials for one student. The next sponsorship pays for the next name on this list."
        ctaLabel="Sponsor a Student"
        ctaHref="/donate"
        tone="teal"
        titleId="students-cta-title"
      />
      <JsonLd id="ld-students-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-students-collection" data={ldCollection} />
    </>
  );
}
