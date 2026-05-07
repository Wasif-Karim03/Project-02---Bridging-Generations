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
}: ActivityCardProps) {
  const { coverImage, title, excerpt, tag, publishedAt } = activity;
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
      </Row.Body>
    </Row>
  );
}
