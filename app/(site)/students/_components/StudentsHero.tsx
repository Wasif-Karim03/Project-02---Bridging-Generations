import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Testimonial } from "@/lib/content/testimonials";
import { StudentsPullQuote } from "./StudentsPullQuote";

type StudentsHeroProps = {
  studentCount: number;
  schoolCount: number;
  pullQuote: Testimonial | null;
};

export function StudentsHero({ studentCount, schoolCount, pullQuote }: StudentsHeroProps) {
  return (
    <section
      aria-labelledby="students-hero-title"
      className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <Eyebrow>The Chittagong Hill Tracts</Eyebrow>
          <h1
            id="students-hero-title"
            className="max-w-[20ch] text-balance text-display-2 text-ink"
          >
            Student Directory
          </h1>
          <p className="max-w-[44ch] text-body-lg text-ink-2">
            {studentCount} sponsored students across {schoolCount} partner schools. First names
            only. Photos appear when — and only when — a written family release is on file for this
            site.
          </p>
        </div>
        {pullQuote ? <StudentsPullQuote testimonial={pullQuote} /> : null}
      </div>
    </section>
  );
}
