import Image from "next/image";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import type { SuccessStory } from "@/lib/content/successStories";

type HomeSuccessPanelProps = {
  stories: Pick<SuccessStory, "slug" | "subjectName" | "subjectRole" | "pullQuote" | "portrait">[];
};

// Spec: 3 cards side by side, each with thumbnail, title, author, "Read More".
// Empty state renders nothing (parent already guards on truthy length).
export function HomeSuccessPanel({ stories }: HomeSuccessPanelProps) {
  if (stories.length === 0) return null;

  return (
    <section
      id="success"
      aria-labelledby="home-success-title"
      className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <Reveal stagger="up">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <Eyebrow>Success stories</Eyebrow>
              <h2
                id="home-success-title"
                className="max-w-[28ch] text-balance text-heading-1 text-ink"
              >
                Students who finished — and what they did next.
              </h2>
            </div>
            <Link
              href="/success-stories"
              className="group inline-flex items-center gap-1 text-nav-link uppercase text-accent transition hover:text-accent-2"
            >
              All stories
              <span
                aria-hidden="true"
                className="transition-transform motion-safe:group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal stagger="up" delay={120} cascade>
          <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <li key={story.slug} data-reveal-item className="flex flex-col">
                <Link
                  href={`/success-stories/${story.slug}`}
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-3">
                    <Image
                      src={story.portrait.src}
                      alt={story.portrait.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-5 flex flex-col gap-2">
                    <h3 className="text-balance text-heading-4 text-ink transition-colors group-hover:text-accent">
                      {story.subjectName}
                    </h3>
                    {story.subjectRole ? (
                      <p className="text-meta uppercase text-ink-2">{story.subjectRole}</p>
                    ) : null}
                    <p className="mt-1 line-clamp-3 text-body-sm text-ink-2">
                      &ldquo;{story.pullQuote}&rdquo;
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-nav-link uppercase text-accent">
                      Read More
                      <span
                        aria-hidden="true"
                        className="transition-transform motion-safe:group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
