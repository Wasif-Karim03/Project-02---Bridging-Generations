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
    grade,
    portrait,
    consent,
    sponsorshipStatus,
    fundingNeed,
    registrationCode,
  } = student;
  const portraitSrc = portrait?.src ?? null;
  const allowPortrait = canShowPortrait(consent) && !!portraitSrc;
  const isSpotlight = variant === "spotlight";
  const isSponsored = sponsorshipStatus === "sponsored";
  const profileHref = `/students/${id}`;
  // Junk/empty grades (non-numeric application data) parse to 0 — hide those.
  const showGrade = typeof grade === "number" && grade > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-hairline bg-ground-2 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-card-hover)] focus-within:-translate-y-1 focus-within:shadow-[var(--shadow-card-hover)]">
      {/* Portrait */}
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
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-heading-6 font-bold uppercase leading-tight tracking-[0.01em] text-ink">
          <Link
            href={profileHref}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
          >
            {displayName}
          </Link>
        </h3>

        {fundingNeed ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-body-sm text-ink">
              <span className="font-bold text-accent-2-text">{fundingNeed.fundedLabel}</span> funded
              of <span className="font-bold text-ink">{fundingNeed.requiredLabel} USD</span>
            </p>
            <div
              className="h-1.5 w-full overflow-hidden bg-ground-3"
              role="progressbar"
              aria-valuenow={fundingNeed.progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-accent-2-text"
                style={{ width: `${Math.max(fundingNeed.progressPct, 2)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-meta uppercase tracking-[0.04em] text-ink-2">
          {registrationCode ? (
            <span>
              Reg no: <span className="text-ink">{registrationCode}</span>
            </span>
          ) : null}
          {showGrade ? (
            <span>
              Grade: <span className="text-ink">{grade}</span>
            </span>
          ) : null}
        </div>

        {fundingNeed?.purpose ? (
          <p className="text-body-sm text-ink-2">
            <span className="font-semibold uppercase tracking-[0.04em] text-ink">Purpose:</span>{" "}
            {fundingNeed.purpose}
          </p>
        ) : null}

        {fundingNeed?.byInstallments && fundingNeed.perInstallmentLabel ? (
          <p className="text-meta uppercase tracking-[0.04em] text-ink-2">
            Per installment —{" "}
            <span className="text-ink">{fundingNeed.perInstallmentLabel} USD</span>
            {fundingNeed.duration ? ` · ${fundingNeed.duration}` : ""}
          </p>
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
