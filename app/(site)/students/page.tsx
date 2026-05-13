import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { isPlaceholder } from "@/lib/content/isPlaceholder";
import { getAllSchools } from "@/lib/content/schools";
import { getStudentsGroupedBySchool } from "@/lib/content/students";
import { getAllTestimonials } from "@/lib/content/testimonials";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { ConsentStatement } from "./_components/ConsentStatement";
import { StudentDirectory } from "./_components/StudentDirectory";
import { StudentsHero } from "./_components/StudentsHero";

export const metadata: Metadata = {
  title: "Students",
  description:
    "Browse the sponsored students at Bridging Generations partner schools across the Chittagong Hill Tracts. First names only; portraits appear only with a written family release on file.",
};

export default async function StudentsPage() {
  const [allSchools, grouped, testimonials] = await Promise.all([
    getAllSchools(),
    getStudentsGroupedBySchool(),
    getAllTestimonials(),
  ]);

  // Schools whose description starts with [CONFIRM:] are unverified — the
  // marker indicates the school's identity itself is unconfirmed, not just
  // its prose. Suppress them site-wide rather than render a partial entry.
  const schools = allSchools.filter(
    (school) => !school.description || !isPlaceholder(school.description),
  );

  const pullQuote =
    testimonials.find((t) => t.speakerRole === "student") ??
    testimonials.find((t) => t.speakerRole === "parent") ??
    null;

  const knownSchoolIds = new Set(schools.map((s) => s.id));
  const allStudents = grouped
    .filter((g) => knownSchoolIds.has(g.schoolId))
    .flatMap((g) => g.students);
  const studentCount = allStudents.length;
  const schoolCount = new Set(allStudents.map((s) => s.schoolId)).size;
  const waitingCount = allStudents.filter((s) => s.sponsorshipStatus === "waiting").length;
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
      <StudentDirectory students={allStudents} schools={schools} />
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
