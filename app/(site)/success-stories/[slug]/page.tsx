import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dropcap } from "@/components/content/Dropcap";
import { MarginaliaRail } from "@/components/content/MarginaliaRail";
import { MDXRenderer } from "@/components/content/MDXRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionAct } from "@/components/ui/SectionAct";
import { canShowSuccessStory } from "@/lib/content/canShowPortrait";
import { readingTime } from "@/lib/content/readingTime";
import { getAllStudents } from "@/lib/content/students";
import {
  getAllSuccessStories,
  getRelatedSuccessStories,
  getSuccessStoryBySlug,
} from "@/lib/content/successStories";
import { articleLd, breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { BackToStories } from "./_components/BackToStories";
import { PortraitHero } from "./_components/PortraitHero";
import { PullQuotePanel } from "./_components/PullQuotePanel";

type Params = { slug: string };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllSuccessStories();
  return all.filter((s) => s.published).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);
  if (!story) return { title: "Not found" };
  const title = story.metaTitle || `${story.subjectName} — Success story`;
  const description = story.metaDescription || story.pullQuote;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: story.ogImageOverride?.src ? [story.ogImageOverride.src] : [story.portrait.src],
    },
  };
}

export default async function SuccessStorySlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);
  if (!story) notFound();

  const [students, related] = await Promise.all([
    getAllStudents(),
    getRelatedSuccessStories({ exclude: slug, limit: 2 }),
  ]);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const linkedStudent = story.linkedStudentId
    ? (studentById.get(story.linkedStudentId) ?? null)
    : null;
  const showPortrait = canShowSuccessStory({
    linkedStudentId: story.linkedStudentId,
    linkedStudent,
  });

  const body = await story.body();
  const dateline = story.publishedAt ? dateFmt.format(new Date(story.publishedAt)) : "";
  const { label: readTimeLabel } = readingTime(body);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Success Stories", url: "/success-stories" },
    { name: story.subjectName, url: `/success-stories/${story.slug}` },
  ]);
  const ldArticle = articleLd({
    siteUrl: SITE_URL,
    url: `/success-stories/${story.slug}`,
    headline: `${story.subjectName} — Success story`,
    datePublished: story.publishedAt ?? undefined,
    imageUrl: story.portrait.src,
    publisherName: "Bridging Generations",
  });

  const renderedBody = story.dropcap ? (
    <Dropcap>
      <MDXRenderer source={body} />
    </Dropcap>
  ) : (
    <MDXRenderer source={body} />
  );

  return (
    <div className="atmospheric-page">
      <BackToStories />
      <h1 id="success-story-title" className="sr-only">
        {story.subjectName} — Success story
      </h1>
      <PortraitHero story={story} showPortrait={showPortrait} />
      <PullQuotePanel story={story} />
      <article className="bg-ground px-4 pt-12 pb-16 sm:px-6 lg:px-[6%] lg:pt-16 lg:pb-24">
        <div className="longform-spine">
          <MarginaliaRail
            dateline={dateline}
            readTime={readTimeLabel}
            shareTitle={`${story.subjectName} — Success story`}
          />
          <SectionAct className="text-ink-2">{renderedBody}</SectionAct>
        </div>
      </article>
      {related[0] ? (
        <section
          aria-labelledby="success-story-related-title"
          className="bg-ground px-4 pt-12 pb-20 sm:px-6 lg:px-[6%] lg:pt-16 lg:pb-28"
        >
          <div className="mx-auto max-w-[65ch] border-hairline border-t pt-10 lg:pt-14">
            <p
              id="success-story-related-title"
              className="text-eyebrow tracking-[0.18em] text-ink-2 uppercase"
            >
              Continue reading
            </p>
            <h2 className="mt-5 text-balance text-heading-2 text-ink">
              <a
                href={`/success-stories/${related[0].slug}`}
                className="transition hover:text-accent-2-text"
              >
                {related[0].subjectName}
              </a>
            </h2>
            <p className="mt-4 max-w-[60ch] text-body text-ink-2 italic">
              &ldquo;{related[0].pullQuote}&rdquo;
            </p>
            {related[0].subjectRole ? (
              <p className="mt-5 text-meta uppercase text-ink-2">{related[0].subjectRole}</p>
            ) : null}
          </div>
        </section>
      ) : null}
      <JsonLd id={`ld-story-${slug}-breadcrumb`} data={ldBreadcrumb} />
      <JsonLd id={`ld-story-${slug}-article`} data={ldArticle} />
    </div>
  );
}
