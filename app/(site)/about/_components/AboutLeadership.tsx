import { BoardMemberCard } from "@/components/domain/BoardMemberCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { TeamGroup, TeamGroupedMembers } from "@/lib/content/boardMembers";

type AboutLeadershipProps = {
  grouped: TeamGroupedMembers;
};

type SectionConfig = {
  group: TeamGroup;
  eyebrow: string;
  title: string;
  intro?: string;
};

// Render order mirrors the spec: Board → Moderators → R&D → Accounting →
// Coordinators → (Mentors live on /mentors as a dedicated showcase, not here)
const SECTIONS: SectionConfig[] = [
  {
    group: "board",
    eyebrow: "Leadership",
    title: "Board of Directors",
    intro: "The five board members guiding Bridging Generations across continents.",
  },
  {
    group: "moderator",
    eyebrow: "Moderators",
    title: "Communications & moderation",
    intro: "The communicators who keep students, donors, and the board in sync.",
  },
  {
    group: "rnd",
    eyebrow: "R&D",
    title: "Research & Development",
    intro: "The volunteers researching scholarships, schools, and where to grow next.",
  },
  {
    group: "accounting",
    eyebrow: "Accounting",
    title: "Accounting",
    intro: "The people tracking every donated dollar and report.",
  },
  {
    group: "coordinator",
    eyebrow: "Coordinators",
    title: "Co-ordinators",
    intro: "On-the-ground coordinators between schools, students, and the board.",
  },
];

export function AboutLeadership({ grouped }: AboutLeadershipProps) {
  // If nobody is configured for any of the on-page sections, skip.
  const hasAny = SECTIONS.some((s) => grouped[s.group].length > 0);
  if (!hasAny) return null;

  return (
    <section
      id="leadership"
      aria-labelledby="about-leadership-title"
      className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 lg:gap-24">
        <header className="flex flex-col gap-4">
          <Eyebrow>The team</Eyebrow>
          <h2
            id="about-leadership-title"
            className="max-w-[28ch] text-balance text-heading-1 text-ink"
          >
            The people behind Bridging Generations.
          </h2>
        </header>
        {SECTIONS.map((section) => {
          const members = grouped[section.group];
          if (members.length === 0) return null;
          return (
            <div
              key={section.group}
              id={`team-${section.group}`}
              className="flex flex-col gap-8 lg:gap-10"
            >
              <header className="flex flex-col gap-3 border-t border-hairline pt-6">
                <Eyebrow>{section.eyebrow}</Eyebrow>
                <h3 className="text-balance text-heading-2 text-ink">{section.title}</h3>
                {section.intro ? (
                  <p className="max-w-[60ch] text-body text-ink-2">{section.intro}</p>
                ) : null}
              </header>
              <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <li key={member.id}>
                    <BoardMemberCard member={member} variant={section.group} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
