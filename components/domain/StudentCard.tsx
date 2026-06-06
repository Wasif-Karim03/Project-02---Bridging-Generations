import Image from "next/image";
import { Link } from "next-view-transitions";
import { StudentPlaceholder } from "@/components/ui/StudentPlaceholder";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import type { Student } from "@/lib/content/students";

type StudentCardProps = {
  student: Student;
  variant?: "default" | "spotlight";
};

export function StudentCard({ student, variant = "default" }: StudentCardProps) {
  const {
    id,
    displayName,
    community,
    grade,
    quote,
    portrait,
    consent,
    sponsorshipStatus,
    fundingNeed,
  } = student;
  const portraitSrc = portrait?.src ?? null;
  const allowPortrait = canShowPortrait(consent) && !!portraitSrc;
  const isSpotlight = variant === "spotlight";
  const isSponsored = sponsorshipStatus === "sponsored";
  const sponsorshipLabel = isSponsored ? "sponsored" : "needs a sponsor";
  const profileHref = `/students/${id}`;
  // Junk/empty grades (e.g. non-numeric application data) parse to 0 — hide
  // rather than print "Grade 0".
  const showGrade = typeof grade === "number" && grade > 0;
  const metaParts = [showGrade ? `Grade ${grade}` : null, community].filter(Boolean);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden border border-hairline bg-ground-2 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-card-hover)] focus-within:-translate-y-1 focus-within:shadow-[var(--shadow-card-hover)]"
      aria-label={`${displayName}, ${sponsorshipLabel}${showGrade ? `, grade ${grade}` : ""}`}
    >
      {/* Portrait with gradient scrim, status badge, and name overlaid */}
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
            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.06] motion-safe:group-focus-within:scale-[1.06]"
          />
        ) : (
          <StudentPlaceholder />
        )}

        {/* Readability scrim — keeps the badge + name legible over any photo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent"
        />

        {/* Sponsorship status badge */}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
            isSponsored ? "bg-accent text-white" : "bg-white/95 text-ink"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${isSponsored ? "bg-white" : "bg-accent-2-text"}`}
          />
          {isSponsored ? "Sponsored" : "Needs a sponsor"}
        </span>

        {/* Name + grade over the photo */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
          <h3 className="text-heading-5 font-bold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            <Link
              href={profileHref}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
            >
              {displayName}
            </Link>
          </h3>
          {metaParts.length > 0 ? (
            <p className="text-meta uppercase tracking-[0.06em] text-white/85">
              {metaParts.join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Body — aspiration, funding ask, and a view-profile affordance */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {quote ? <p className="text-body-sm italic text-ink-2">&ldquo;{quote}&rdquo;</p> : null}

        {fundingNeed ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 border border-accent-2-text/20 bg-accent-2-text/[0.06] px-3 py-2">
              <span className="text-meta uppercase tracking-[0.06em] text-ink-2">Needs</span>
              <span className="text-heading-6 font-bold tabular-nums text-accent-2-text">
                {fundingNeed.amountLabel}
              </span>
            </div>
            {fundingNeed.byInstallments && fundingNeed.perInstallmentLabel ? (
              <p className="text-meta text-ink-2">
                {fundingNeed.perInstallmentLabel}/installment
                {fundingNeed.duration ? ` · ${fundingNeed.duration}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-nav-link uppercase text-accent transition-colors group-hover:text-accent-2-text">
          View profile
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </article>
  );
}
