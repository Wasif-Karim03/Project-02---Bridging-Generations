import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "@/components/ui/Reveal";
import type { BoardMember } from "@/lib/content/boardMembers";

type BoardMemberCardProps = {
  member: BoardMember;
  headingLevel?: 2 | 3;
};

export function BoardMemberCard({ member, headingLevel = 3 }: BoardMemberCardProps) {
  const { name, role, bio, portrait } = member;
  const HeadingTag = headingLevel === 2 ? "h2" : "h3";
  const portraitSrc = portrait?.src ?? null;
  const portraitAlt = portrait?.alt?.length ? portrait.alt : name;

  return (
    <article className="group flex h-full flex-col gap-5 bg-ground-2">
      {portraitSrc ? (
        <Reveal kind="develop" className="relative aspect-[4/5] w-full overflow-hidden bg-ground-3">
          <Image
            src={portraitSrc}
            alt={portraitAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04] motion-safe:group-active:scale-[1.02]"
          />
          <span aria-hidden="true" className="portrait-vignette" />
        </Reveal>
      ) : (
        <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-ground-3">
          <Avatar name={name} size="lg" />
        </div>
      )}
      <div className="flex flex-col gap-3 p-6">
        <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">{role}</span>
        <HeadingTag className="text-balance text-heading-5 text-ink">{name}</HeadingTag>
        <p className="text-body text-ink-2">{bio}</p>
      </div>
    </article>
  );
}
