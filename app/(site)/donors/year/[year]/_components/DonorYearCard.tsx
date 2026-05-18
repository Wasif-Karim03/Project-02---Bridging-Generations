import { Link } from "next-view-transitions";
import type { DonorYearItem } from "./DonorYearGrid";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0] ?? "";
  if (words.length === 1) return first.slice(0, 2).toUpperCase();
  const second = words[1] ?? "";
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
}

export function DonorYearCard({ item }: { item: DonorYearItem }) {
  const { id, displayName, photoUrl, country, totalDonated } = item;

  return (
    <Link
      href={`/donors/${id}`}
      className="group flex flex-col bg-ground-2 transition-shadow duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
      aria-label={`${displayName}${country ? `, ${country}` : ""} — view donor profile`}
    >
      {/* Photo / initials area */}
      <div className="relative aspect-square w-full overflow-hidden bg-ground-3">
        {photoUrl ? (
          // biome-ignore lint/performance/noImgElement: external URL, avoids next/image remotePatterns config
          <img
            src={photoUrl}
            alt={displayName}
            className="h-full w-full object-cover transition-[filter] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:saturate-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              role="img"
              aria-label={displayName}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-ground font-semibold text-[28px] text-accent"
            >
              {getInitials(displayName)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <p className="text-body-sm font-medium leading-snug text-ink">
          {displayName}
        </p>
        {country ? (
          <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {country}
          </p>
        ) : null}
        <p className="text-meta text-ink-2">
          ${totalDonated.toLocaleString("en-US")} donated
        </p>
      </div>
    </Link>
  );
}
