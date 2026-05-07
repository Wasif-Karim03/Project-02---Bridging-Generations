import Image from "next/image";
import type { CSSProperties } from "react";
import { StudentPlaceholder } from "@/components/ui/StudentPlaceholder";
import { toFocalPoint } from "@/lib/content/focalPoint";
import type { SuccessStory } from "@/lib/content/successStories";

type PortraitHeroProps = {
  story: SuccessStory;
  showPortrait: boolean;
};

export function PortraitHero({ story, showPortrait }: PortraitHeroProps) {
  // R4.6 aspect ladder — face placed in upper-third golden zone instead of
  // letterboxed at 16:9 (where it shrank to ~12% of frame). Portrait formats
  // bring the subject to ~30–40% of the composition at every viewport.
  // R4.11 — at <640px, honor per-story portraitMobileFocalPoint via CSS vars
  // on `.mobile-fp` (declared in globals.css). Desktop keeps the hardcoded
  // "center 30%" fallback used since R4.6.
  const fp = toFocalPoint(story.portraitMobileFocalPoint);
  const wrapperBase =
    "relative mobile-fp mx-auto aspect-[5/6] w-full max-w-[90ch] overflow-hidden sm:aspect-[4/5] lg:aspect-[3/4]";
  const imageWrapperClass = story.heroDuotone ? `${wrapperBase} hero-duotone` : wrapperBase;
  const wrapperStyle: CSSProperties = {
    ...(fp ? { "--mobile-fp-x": `${fp.x}%`, "--mobile-fp-y": `${fp.y}%` } : null),
    ...(showPortrait ? { viewTransitionName: "success-story-hero" } : null),
  } as CSSProperties;

  return (
    <section aria-labelledby="success-story-title" className="relative bg-ground-3">
      <div className={imageWrapperClass} style={wrapperStyle}>
        {showPortrait ? (
          <Image
            src={story.portrait.src}
            alt={story.portrait.alt}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1280px) 1120px, 100vw"
            className="kenburns object-cover object-[center_30%]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-ground-3">
            <div className="size-48 sm:size-64">
              <StudentPlaceholder />
            </div>
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent"
        />
        {/* Caption — editorial framing. A small accent-3 (amber) rule precedes
            a "PROFILE" eyebrow, then the subject name as display copy, then
            role as meta. Reads as a magazine masthead caption, not a social
            post overlay. */}
        <div className="absolute right-0 bottom-0 left-0 px-6 pb-8 sm:px-10 sm:pb-10 lg:px-16 lg:pb-14">
          <div className="mx-auto flex max-w-[90ch] flex-col items-start gap-3 text-white">
            <span aria-hidden="true" className="block h-[2px] w-12 bg-accent-3" />
            <p className="text-eyebrow tracking-[0.22em] text-accent-3 uppercase">Profile</p>
            <p className="text-balance text-heading-2 leading-tight">{story.subjectName}</p>
            {story.subjectRole ? (
              <p className="text-meta uppercase opacity-80">{story.subjectRole}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
