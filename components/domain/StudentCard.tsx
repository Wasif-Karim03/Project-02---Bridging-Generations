import Image from "next/image";
import { Link } from "next-view-transitions";
import { TealPaperclip } from "@/components/motif/TealPaperclip";
import { StudentPlaceholder } from "@/components/ui/StudentPlaceholder";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import type { Student } from "@/lib/content/students";

type StudentCardProps = {
  student: Student;
  variant?: "default" | "spotlight";
};

export function StudentCard({ student, variant = "default" }: StudentCardProps) {
  const { id, displayName, community, grade, quote, portrait, consent, sponsorshipStatus } =
    student;
  const portraitSrc = portrait?.src ?? null;
  const allowPortrait = canShowPortrait(consent) && !!portraitSrc;
  const isSpotlight = variant === "spotlight";
  const isSponsored = sponsorshipStatus === "sponsored";
  const sponsorshipLabel = isSponsored ? "sponsored" : "awaiting sponsor";
  const profileHref = `/students/${id}`;

  return (
    <article
      className="group relative flex h-full flex-col gap-4 bg-ground-2"
      aria-label={`${displayName}, ${sponsorshipLabel}, grade ${grade}`}
    >
      {isSponsored ? (
        <TealPaperclip className="pointer-events-none absolute -top-2 left-4 z-10 h-10 w-6" />
      ) : null}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-3">
        {allowPortrait && portraitSrc ? (
          <Image
            src={portraitSrc}
            alt={portrait?.alt ?? ""}
            fill
            sizes={
              isSpotlight
                ? "(min-width: 1024px) 360px, (min-width: 640px) 320px, 280px"
                : "(min-width: 1024px) 25vw, 50vw"
            }
            className="object-cover transition-[filter] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:saturate-[1.04] motion-safe:group-focus-within:saturate-[1.04] motion-safe:group-active:saturate-[1.04]"
          />
        ) : (
          <StudentPlaceholder />
        )}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-heading-5 text-ink">
          <Link
            href={profileHref}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
          >
            {displayName}
          </Link>
        </h3>
        <p className="text-meta uppercase text-ink-2">
          Grade {grade}
          {community ? ` · ${community}` : ""}
        </p>
        {quote ? <p className="text-body-sm text-ink-2">&ldquo;{quote}&rdquo;</p> : null}
      </div>
    </article>
  );
}
