import { Link } from "next-view-transitions";
import { StudentCard } from "@/components/domain/StudentCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Student } from "@/lib/content/students";

type SpotlightBandProps = {
  eyebrow: string;
  headline: string;
  body: string;
  students: Student[];
};

// HSC/SSC spotlight — admin-toggled band on /students. Renders the curated
// students (typically grade 10/11/12) with quick per-student donate CTAs.
export function SpotlightBand({ eyebrow, headline, body, students }: SpotlightBandProps) {
  if (students.length === 0) return null;
  return (
    <section
      id="hsc-ssc-spotlight"
      aria-labelledby="hsc-ssc-spotlight-title"
      className="scroll-mt-20 bg-accent-3/15 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-4">
          <Eyebrow className="text-accent-2-text!">{eyebrow}</Eyebrow>
          <h2
            id="hsc-ssc-spotlight-title"
            className="max-w-[36ch] text-balance text-heading-2 text-ink"
          >
            {headline}
          </h2>
          <p className="max-w-[60ch] text-body text-ink-2">{body}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {students.slice(0, 8).map((student) => (
            <li key={student.id} className="flex flex-col gap-2">
              <StudentCard student={student} />
              <Link
                href={`/donate?student=${encodeURIComponent(student.id)}`}
                className="inline-flex min-h-[40px] items-center justify-center bg-accent-2-text px-3 text-meta uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent-2-hover"
              >
                Donate
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
