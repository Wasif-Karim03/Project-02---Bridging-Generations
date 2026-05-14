import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { RulesSection } from "@/components/content/RulesSection";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { ProgramCard } from "@/components/domain/ProgramCard";
import { TeacherPanel } from "@/components/domain/TeacherPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getProjectsByStatus } from "@/lib/content/projects";
import { getProjectsPage } from "@/lib/content/projectsPage";
import { getAllSchools } from "@/lib/content/schools";
import { getAllTeachers } from "@/lib/content/teachers";
import { pickFeatureIndices } from "@/lib/projects/pickFeatureIndices";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { FundedRecap } from "./_components/FundedRecap";
import { ProjectsHero } from "./_components/ProjectsHero";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "The projects that fund everything a classroom needs at our partner schools — meals, books, scholarships, labs, and libraries.",
};

export default async function ProjectsPage() {
  const [{ active, paused, funded }, projectsPage, teachers, schools] = await Promise.all([
    getProjectsByStatus(),
    getProjectsPage(),
    getAllTeachers(),
    getAllSchools(),
  ]);
  const list = [...active, ...paused];
  const totalRaised = list.reduce((sum, p) => sum + p.fundingRaised, 0);

  const rulesBody = projectsPage?.rulesBody ? await projectsPage.rulesBody() : "";

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/projects",
    name: "Projects",
    description: "Core initiatives funded by Bridging Generations.",
  });

  return (
    <>
      <ProjectsHero count={list.length} totalRaised={totalRaised} />

      {/* Scholarships pointer — quick path to the sub-page */}
      <section
        aria-label="Scholarships sub-program"
        className="bg-ground-3 px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Sub-program</Eyebrow>
            <h2 className="mt-2 max-w-[28ch] text-balance text-heading-3 text-ink">
              Scholarships — our flagship sub-program.
            </h2>
            <p className="mt-2 max-w-[60ch] text-body-sm text-ink-2">
              Eligibility, what we cover, and how to apply.
            </p>
          </div>
          <Link
            href="/projects/scholarships"
            className="inline-flex min-h-[48px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
          >
            See Scholarships
          </Link>
        </div>
      </section>

      <section
        aria-label="Active and paused projects"
        className="bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-16 lg:gap-20">
          {(() => {
            const featureIndices = pickFeatureIndices(list.length);
            return list.map((project, i) =>
              featureIndices.has(i) ? (
                <ProgramCard key={project.id} project={project} scale="feature" />
              ) : (
                <ProgramCard key={project.id} project={project} scale="row" />
              ),
            );
          })()}
        </div>
      </section>

      <FundedRecap projects={funded} />

      {/* Schools pointer */}
      {schools.length > 0 ? (
        <section
          aria-label="Schools"
          className="bg-ground-2 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
        >
          <div className="mx-auto max-w-[1280px]">
            <Eyebrow>Schools</Eyebrow>
            <h2 className="mt-2 max-w-[36ch] text-balance text-heading-2 text-ink">
              The schools where every project is delivered.
            </h2>
            <p className="mt-3 max-w-[60ch] text-body text-ink-2">
              Each partner school has its own overview, student roster, and teacher list.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {schools.map((school) => (
                <li key={school.id}>
                  <Link
                    href={`/schools/${school.id}`}
                    className="group flex h-full flex-col gap-2 border border-hairline bg-ground p-5 shape-bevel transition hover:border-accent"
                  >
                    <h3 className="text-heading-5 text-ink group-hover:text-accent">
                      {school.name}
                    </h3>
                    {school.description ? (
                      <p className="line-clamp-2 text-body-sm text-ink-2">{school.description}</p>
                    ) : null}
                    <span className="mt-auto text-nav-link uppercase text-accent">
                      View school →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <TeacherPanel
        eyebrow={projectsPage?.teachersEyebrow ?? "Teachers"}
        headline={projectsPage?.teachersHeadline ?? "The teachers carrying our students through."}
        intro={projectsPage?.teachersIntro}
        teachers={teachers}
        schools={schools}
      />

      <RulesSection
        id="rules"
        eyebrow="Project rules"
        title="How projects, applications, and revocation work."
        intro={projectsPage?.rulesIntro}
        body={rulesBody}
      />

      <CTAFooterPanel
        headline="Back a project that moves the needle."
        body="Every gift goes straight to a named line item — not overhead. Start or increase a sponsorship, or direct a gift to a specific project above."
        ctaLabel="Donate now"
        ctaHref="/donate"
        tone="cream"
        titleId="projects-cta-title"
      />
      <JsonLd id="ld-projects-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-projects-collection" data={ldCollection} />
    </>
  );
}
