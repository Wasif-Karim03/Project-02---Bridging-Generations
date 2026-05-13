import { BoardMemberCard } from "@/components/domain/BoardMemberCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { BoardMember } from "@/lib/content/boardMembers";

type AboutLeadershipProps = {
  boardMembers: BoardMember[];
};

// Cards render developed at first paint — same reasoning as
// AboutMissionVision: the section sits below the fold on /about and the
// per-card <Reveal> wrappers stayed at opacity-0 in audit captures.
export function AboutLeadership({ boardMembers }: AboutLeadershipProps) {
  if (boardMembers.length === 0) return null;

  return (
    <section
      id="leadership"
      aria-labelledby="about-leadership-title"
      className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 lg:gap-14">
        <div className="flex flex-col gap-4">
          <Eyebrow>Leadership</Eyebrow>
          <h2
            id="about-leadership-title"
            className="max-w-[24ch] text-balance text-heading-2 text-ink"
          >
            Our board of directors.
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {boardMembers.map((member, index) => (
            <li
              key={member.id}
              className={index === 0 ? "lg:-translate-x-4 lg:translate-y-4" : undefined}
            >
              <BoardMemberCard member={member} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
