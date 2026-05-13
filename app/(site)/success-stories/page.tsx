import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Feature, Row } from "@/components/ui/editorial";
import { Reveal } from "@/components/ui/Reveal";
import { StudentPlaceholder } from "@/components/ui/StudentPlaceholder";
import { canShowSuccessStory } from "@/lib/content/canShowPortrait";
import type { Student } from "@/lib/content/students";
import { getAllStudents } from "@/lib/content/students";
import { getAllSuccessStoriesPublished, type SuccessStory } from "@/lib/content/successStories";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { SuccessStoriesHero } from "./_components/SuccessStoriesHero";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "In-depth stories from current students, alumni, and families sponsored by Bridging Generations across the Chittagong Hill Tracts.",
};

type StoryWithConsent = {
  story: SuccessStory;
  showPortrait: boolean;
};

export default async function SuccessStoriesPage() {
  const [stories, students] = await Promise.all([
    getAllSuccessStoriesPublished(),
    getAllStudents(),
  ]);
  const studentById = new Map<string, Student>(students.map((s) => [s.id, s]));

  const annotated: StoryWithConsent[] = stories.map((story) => {
    const linkedStudent = story.linkedStudentId
      ? (studentById.get(story.linkedStudentId) ?? null)
      : null;
    return {
      story,
      showPortrait: canShowSuccessStory({
        linkedStudentId: story.linkedStudentId,
        linkedStudent,
      }),
    };
  });

  // Feature variant cannot scale a placeholder — promote the first
  // consent-passing story to Feature; others render as Row siblings (a
  // consent-blocked story renders Row with the StudentPlaceholder).
  const featureIdx = annotated.findIndex((a) => a.showPortrait);
  const feature = featureIdx >= 0 ? annotated[featureIdx] : null;
  const rows = annotated.filter((_, i) => i !== featureIdx);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Success Stories", url: "/success-stories" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/success-stories",
    name: "Success Stories",
  });

  return (
    <>
      <SuccessStoriesHero count={stories.length} />
      <section
        aria-label="All success stories"
        className="bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-16 lg:gap-20">
          {feature ? (
            <Feature>
              <Reveal kind="develop">
                <Feature.Image
                  src={feature.story.portrait.src}
                  alt={feature.story.portrait.alt}
                  aspect="4/5"
                  bleed
                  priority
                  viewTransitionName="success-story-hero"
                />
              </Reveal>
              <Feature.Body>
                {feature.story.subjectRole ? (
                  <Feature.Eyebrow>{feature.story.subjectRole}</Feature.Eyebrow>
                ) : null}
                <Feature.Headline as="h2" href={`/success-stories/${feature.story.slug}`}>
                  {feature.story.subjectName}’s story
                </Feature.Headline>
                <Feature.Lede>{feature.story.pullQuote}</Feature.Lede>
              </Feature.Body>
            </Feature>
          ) : null}
          {rows.length > 0 ? (
            <ul className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
              {rows.map(({ story, showPortrait }) => (
                <Row as="li" key={story.slug}>
                  {showPortrait ? (
                    <Reveal kind="develop">
                      <Row.Image src={story.portrait.src} alt={story.portrait.alt} aspect="4/5" />
                    </Reveal>
                  ) : (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-3">
                      <StudentPlaceholder />
                    </div>
                  )}
                  <Row.Body>
                    {story.subjectRole ? <Row.Eyebrow>{story.subjectRole}</Row.Eyebrow> : null}
                    <Row.Headline href={`/success-stories/${story.slug}`}>
                      {story.subjectName}’s story
                    </Row.Headline>
                    <Row.Lede>{story.pullQuote}</Row.Lede>
                  </Row.Body>
                </Row>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
      <CTAFooterPanel
        headline="Back the next story."
        body="Sponsorship is how these stories start. $30 a month covers tuition, books, daily meals, and materials for one student — long enough to see a whole arc through."
        ctaLabel="Sponsor a Student"
        ctaHref="/donate"
        tone="teal"
        titleId="success-stories-cta-title"
      />
      <JsonLd id="ld-success-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-success-collection" data={ldCollection} />
    </>
  );
}
