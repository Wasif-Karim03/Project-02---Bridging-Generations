import Image from "next/image";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import type { SuccessStory } from "@/lib/content/successStories";

type HomeSuccessPanelProps = {
  story: Pick<SuccessStory, "slug" | "subjectName" | "subjectRole" | "pullQuote" | "portrait">;
};

export function HomeSuccessPanel({ story }: HomeSuccessPanelProps) {
  return (
    <section
      id="success"
      aria-labelledby="home-success-title"
      className="teal-panel relative grid scroll-mt-20 grid-cols-1 items-stretch overflow-hidden text-white lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)]"
    >
      <Reveal
        kind="develop"
        className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2 lg:aspect-auto lg:min-h-[640px]"
      >
        <Image
          src={story.portrait.src}
          alt={story.portrait.alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </Reveal>
      <Reveal
        stagger="left"
        delay={300}
        className="flex flex-col justify-center gap-6 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24"
      >
        <Eyebrow className="text-white/75!">A success story</Eyebrow>
        <blockquote className="flex flex-col gap-6">
          <p id="home-success-title" className="text-balance text-heading-2">
            &ldquo;{story.pullQuote}&rdquo;
          </p>
          <footer className="flex flex-col gap-1">
            <cite className="not-italic text-heading-5">{story.subjectName}</cite>
            <span className="text-meta uppercase text-white/75">{story.subjectRole}</span>
          </footer>
        </blockquote>
        <Link
          href={`/success-stories/${story.slug}`}
          className="group inline-flex items-center gap-1 text-nav-link uppercase text-white transition hover:text-accent-3"
        >
          Read {story.subjectName}&rsquo;s story
          <span
            aria-hidden="true"
            className="transition-transform motion-safe:group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
