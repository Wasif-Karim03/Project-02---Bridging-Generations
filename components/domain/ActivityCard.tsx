import { Link } from "next-view-transitions";
import { Row } from "@/components/ui/editorial";
import { Reveal } from "@/components/ui/Reveal";
import type { Activity } from "@/lib/content/activities";
import { ACTIVITY_TAG_LABELS } from "@/lib/content/activityTags";
import { relativeTime } from "@/lib/dates/relativeTime";

type ActivityCardProps = {
  activity: Activity;
  /** When the card lives in a `<ul>`/`<ol>`, render the root as `<li>`. */
  as?: "article" | "li";
  /**
   * Hide the hairline rule above this row — set on the first item of a list
   * if the list visually attaches to the element above it. Defaults to showing
   * the rule.
   */
  hideRule?: boolean;
  /**
   * Mark this card's image as the LCP candidate for the route. Adds `priority`
   * (preload) and `fetchPriority="high"` to the underlying Row.Image. Use only
   * on the first above-the-fold card.
   */
  priority?: boolean;
  /**
   * When true, render a "Read more" link + (if pdfUrl is set) a PDF download
   * link below the excerpt. Used by the homepage activity feed per spec.
   */
  showActions?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormatter.format(d);
}

function relativeStamp(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return relativeTime(d);
  } catch {
    return null;
  }
}

export function ActivityCard({
  activity,
  as = "article",
  hideRule = false,
  priority = false,
  showActions = false,
}: ActivityCardProps) {
  const { coverImage, title, excerpt, tag, publishedAt, pdfUrl } = activity;
  const stamp = relativeStamp(publishedAt);
  return (
    <Row as={as} hideRule={hideRule}>
      <Reveal kind="develop">
        <Row.Image src={coverImage.src} alt={coverImage.alt} aspect="4/3" priority={priority} />
      </Reveal>
      <Row.Body>
        <Row.Eyebrow>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          {stamp ? (
            <>
              <span aria-hidden="true"> · </span>
              <span>{stamp}</span>
            </>
          ) : null}
          <span aria-hidden="true"> · </span>
          <span>{ACTIVITY_TAG_LABELS[tag]}</span>
        </Row.Eyebrow>
        <Row.Headline>{title}</Row.Headline>
        <Row.Lede>{excerpt}</Row.Lede>
        {showActions ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-nav-link uppercase">
            <Link
              href="/activities"
              className="inline-flex items-center gap-1 text-accent transition hover:text-accent-2-text"
            >
              Read More
              <span aria-hidden="true">→</span>
            </Link>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent-2-text underline underline-offset-[3px] transition hover:no-underline"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Report (PDF)
              </a>
            ) : null}
          </div>
        ) : null}
      </Row.Body>
    </Row>
  );
}
