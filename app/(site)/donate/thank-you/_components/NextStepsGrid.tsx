import { HorizonLine } from "@/components/motif/HorizonLine";
import { Feature, Row, Tile } from "@/components/ui/editorial";
import { Reveal } from "@/components/ui/Reveal";
import { canShowSuccessStory } from "@/lib/content/canShowPortrait";
import { getAllStudents } from "@/lib/content/students";
import { getAllSuccessStoriesPublished } from "@/lib/content/successStories";
import { ShareRow } from "./ShareRow";
import { SubscribeForm } from "./SubscribeForm";

export async function NextStepsGrid() {
  const [stories, students] = await Promise.all([
    getAllSuccessStoriesPublished(),
    getAllStudents(),
  ]);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const story = stories.find((s) =>
    canShowSuccessStory({
      linkedStudentId: s.linkedStudentId,
      linkedStudent: s.linkedStudentId ? (studentById.get(s.linkedStudentId) ?? null) : null,
    }),
  );

  return (
    <>
      <section
        aria-labelledby="thank-you-subscribe-title"
        className="relative overflow-hidden bg-ground px-4 pt-20 pb-16 sm:px-6 lg:px-[6%] lg:pt-28 lg:pb-20"
      >
        <HorizonLine
          tone="on-cream"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-20 w-full -scale-y-100"
        />
        <Reveal>
          <div className="relative z-10 mx-auto max-w-[1280px]">
            <Feature breakout={false}>
              <Feature.Body>
                <Feature.Eyebrow>Stay in touch</Feature.Eyebrow>
                <Feature.Headline as="h2">
                  <span id="thank-you-subscribe-title">Stay on the quarterly update.</span>
                </Feature.Headline>
                <Feature.Lede>
                  One letter every three months — what your sponsorship moved, who finished a year,
                  what comes next. No campaigns, no urgency emails.
                </Feature.Lede>
                <SubscribeForm />
              </Feature.Body>
            </Feature>
          </div>
        </Reveal>
      </section>

      {/* Reveal intentionally dropped from the share + read-next sections.
          At narrow viewports the stacked reveals push these well past the
          IntersectionObserver's -10% rootMargin and they paint at opacity:0
          on first load, leaving a visible white-space gap. The hero + subscribe
          sections above still keep their entrance Reveal. */}
      <section
        aria-labelledby="thank-you-share-title"
        className="bg-ground px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
      >
        <div className="mx-auto max-w-[1280px]">
          <Row hideRule={false} noImage>
            <Row.Eyebrow>Pass it on</Row.Eyebrow>
            <Row.Headline as="h2">
              <span id="thank-you-share-title">Telling a friend fills the next sponsorship.</span>
            </Row.Headline>
            <Row.Lede>
              Word-of-mouth fills classroom seats faster than any campaign we run. The link below
              pre-fills a short message you can edit.
            </Row.Lede>
            <ShareRow />
          </Row>
        </div>
      </section>

      {story ? (
        <section
          aria-labelledby="thank-you-readnext-title"
          className="bg-ground px-4 pt-12 pb-24 sm:px-6 lg:px-[6%] lg:pt-16 lg:pb-32"
        >
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 border-t border-hairline pt-10 lg:pt-12">
            <p className="text-meta uppercase tracking-[0.08em] text-ink-2">Read next</p>
            <h2 id="thank-you-readnext-title" className="sr-only">
              A recent success story
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-10">
              <Tile href={`/success-stories/${story.slug}`}>
                <Tile.Image
                  src={story.portrait.src}
                  alt={story.portrait.alt}
                  aspect="4/5"
                  sizes="(min-width: 640px) 40vw, 100vw"
                />
                <p className="mt-4 text-balance text-heading-4 text-ink transition-colors duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent-2-text group-focus-visible:text-accent-2-text">
                  &ldquo;{story.pullQuote}&rdquo;
                </p>
                <Tile.Label>
                  {story.subjectName}
                  {story.subjectRole ? ` · ${story.subjectRole}` : ""}
                </Tile.Label>
              </Tile>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
