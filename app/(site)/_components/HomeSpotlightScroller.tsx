import { StudentSpotlightScroller } from "@/components/domain/StudentSpotlightScroller";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Student } from "@/lib/content/students";

type HomeSpotlightScrollerProps = {
  students: Student[];
};

export function HomeSpotlightScroller({ students }: HomeSpotlightScrollerProps) {
  return (
    <section
      id="spotlight"
      aria-labelledby="home-spotlight-title"
      className="scroll-mt-20 bg-ground py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <header className="mb-12 flex flex-col gap-3 lg:mb-16">
          <Eyebrow>Meet a few of them</Eyebrow>
          <h2 id="home-spotlight-title" className="text-balance text-heading-2 text-ink">
            The 156, up close
          </h2>
          <p className="max-w-[56ch] text-body text-ink-2">
            Each card represents one sponsored student. First names only; photos render only when a
            signed, in-scope release is on file — otherwise a neutral placeholder takes its place.
          </p>
        </header>
      </div>
      <StudentSpotlightScroller students={students} />
    </section>
  );
}
