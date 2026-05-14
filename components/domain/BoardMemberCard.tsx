import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "@/components/ui/Reveal";
import type { BoardMember } from "@/lib/content/boardMembers";

type BoardMemberCardProps = {
  member: BoardMember;
  headingLevel?: 2 | 3;
  /**
   * Variant determines which secondary fields surface beneath the name.
   * `board`        — role + country + occupation + bio.
   * `moderator`    — role + education + bio.
   * `rnd`          — role + occupation/status + bio.
   * `accounting`   — role + education + date range + bio.
   * `coordinator`  — role + education + date range + bio.
   * `mentor`       — role + education + start date + bio.
   * Defaults to "board" for backwards compatibility with /about Leadership.
   */
  variant?: BoardMember["team"];
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

function buildSecondary(variant: BoardMember["team"], m: BoardMember): string[] {
  const out: string[] = [];
  if (variant === "board") {
    if (m.occupation) out.push(m.occupation);
    if (m.country) out.push(m.country);
  } else if (variant === "moderator" || variant === "mentor") {
    if (m.educationStatus) out.push(m.educationStatus);
  } else if (variant === "rnd") {
    if (m.occupation) out.push(m.occupation);
    if (m.educationStatus) out.push(m.educationStatus);
  } else if (variant === "accounting" || variant === "coordinator") {
    if (m.educationStatus) out.push(m.educationStatus);
  }
  return out;
}

export function BoardMemberCard({ member, headingLevel = 3, variant }: BoardMemberCardProps) {
  const { name, role, bio, portrait, startDate, endDate, team } = member;
  const effectiveVariant = variant ?? team ?? "board";
  const HeadingTag = headingLevel === 2 ? "h2" : "h3";
  const portraitSrc = portrait?.src ?? null;
  const portraitAlt = portrait?.alt?.length ? portrait.alt : name;
  const secondaryLines = buildSecondary(effectiveVariant, member);
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const showDates =
    (effectiveVariant === "accounting" ||
      effectiveVariant === "coordinator" ||
      effectiveVariant === "mentor") &&
    (start || end);

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
        {secondaryLines.length > 0 ? (
          <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {secondaryLines.join(" · ")}
          </p>
        ) : null}
        {showDates ? (
          <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {start ?? "—"} {end ? `→ ${end}` : end === null ? "→ Present" : "→ Present"}
          </p>
        ) : null}
        <p className="text-body text-ink-2">{bio}</p>
      </div>
    </article>
  );
}
