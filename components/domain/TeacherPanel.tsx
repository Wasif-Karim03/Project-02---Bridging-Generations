import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { School } from "@/lib/content/schools";
import type { Teacher } from "@/lib/content/teachers";

type TeacherPanelProps = {
  eyebrow: string;
  headline: string;
  intro?: string;
  teachers: Teacher[];
  schools: School[];
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : dateFormatter.format(d);
}

export function TeacherPanel({ eyebrow, headline, intro, teachers, schools }: TeacherPanelProps) {
  if (teachers.length === 0) return null;
  const schoolName = new Map(schools.map((s) => [s.id, s.name]));
  return (
    <section
      id="teachers"
      aria-labelledby="teachers-title"
      className="scroll-mt-20 bg-ground-2 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id="teachers-title" className="max-w-[36ch] text-balance text-heading-2 text-ink">
            {headline}
          </h2>
          {intro ? <p className="max-w-[60ch] text-body text-ink-2">{intro}</p> : null}
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const portraitSrc = teacher.portrait?.src ?? null;
            const portraitAlt = teacher.portrait?.alt?.length ? teacher.portrait.alt : teacher.name;
            const school = teacher.schoolId ? schoolName.get(teacher.schoolId) : null;
            const started = formatDate(teacher.startedTeaching);
            return (
              <li key={teacher.id}>
                <article className="flex h-full flex-col gap-4">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-3">
                    {portraitSrc ? (
                      <Image
                        src={portraitSrc}
                        alt={portraitAlt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Avatar name={teacher.name} size="lg" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-heading-5 text-ink">{teacher.name}</h3>
                    {teacher.major ? (
                      <p className="text-meta uppercase tracking-[0.06em] text-accent">
                        {teacher.major}
                      </p>
                    ) : null}
                    {school ? <p className="text-body-sm text-ink-2">{school}</p> : null}
                    {teacher.educationStatus ? (
                      <p className="text-body-sm text-ink-2">{teacher.educationStatus}</p>
                    ) : null}
                    {started ? (
                      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                        Teaching since {started}
                      </p>
                    ) : null}
                    {teacher.bio ? (
                      <p className="mt-2 text-body-sm text-ink-2">{teacher.bio}</p>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
