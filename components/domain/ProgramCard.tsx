import Image from "next/image";
import { Link } from "next-view-transitions";
import { Feature, Row } from "@/components/ui/editorial";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Reveal } from "@/components/ui/Reveal";
import { isPlaceholder } from "@/lib/content/isPlaceholder";
import type { Project } from "@/lib/content/projects";
import { relativeTime } from "@/lib/dates/relativeTime";

type ProgramCardProps = {
  project: Project;
  /**
   * `feature` — flagship scale: breakout image, display-2 headline, lede,
   *             progress bar, full ribbon. One per surface, max.
   * `row`     — list scale: hairline rule, image-left, heading-4 headline,
   *             progress bar inline. Default for /projects rest-of-list and
   *             FundedRecap entries.
   * `card`    — compact grid scale: image on top, body below, progress bar,
   *             per-project Donate Now button. Used by the homepage 3-col
   *             projects grid (6 cards).
   */
  scale?: "feature" | "row" | "card";
  as?: "article" | "li";
  hideRule?: boolean;
};

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type Computed = {
  percentage: number;
  isPaused: boolean;
  isFunded: boolean;
  progressLabel: string | undefined;
  progressTone: "default" | "paused" | "funded";
  ribbonStatus: "active" | "paused" | "funded";
  ribbonLabel: string;
  pausedStamp: string | null;
};

function computeProjectFlags(project: Project): Computed {
  const { fundingGoal, fundingRaised, status } = project;
  const percentage = fundingGoal > 0 ? Math.round((fundingRaised / fundingGoal) * 100) : 0;
  const isPaused = status === "paused";
  const isFunded = !isPaused && (status === "funded" || percentage >= 100);
  const progressLabel =
    isFunded || isPaused
      ? undefined
      : `Raised ${dollars.format(fundingRaised)} of ${dollars.format(fundingGoal)}`;
  const progressTone: Computed["progressTone"] = isPaused
    ? "paused"
    : isFunded
      ? "funded"
      : "default";
  const ribbonStatus: Computed["ribbonStatus"] = isFunded
    ? "funded"
    : isPaused
      ? "paused"
      : "active";
  const ribbonLabel = isFunded ? "Fully funded" : isPaused ? "Paused" : "Funding";
  const pausedStamp = isPaused ? "Paused — resuming when funding lands." : null;
  return {
    percentage,
    isPaused,
    isFunded,
    progressLabel,
    progressTone,
    ribbonStatus,
    ribbonLabel,
    pausedStamp,
  };
}

export function ProgramCard({
  project,
  scale = "row",
  as = "article",
  hideRule = false,
}: ProgramCardProps) {
  const flags = computeProjectFlags(project);
  const ariaLabel = `${project.title}, ${flags.ribbonLabel.toLowerCase()}`;
  if (scale === "feature")
    return <FeatureCard project={project} flags={flags} ariaLabel={ariaLabel} />;
  if (scale === "card")
    return <GridCard project={project} flags={flags} as={as} ariaLabel={ariaLabel} />;
  return (
    <RowCard project={project} flags={flags} as={as} hideRule={hideRule} ariaLabel={ariaLabel} />
  );
}

const dollarsCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

type GridCardProps = CardProps & { as: "article" | "li" };

function GridCard({ project, flags, as: Tag, ariaLabel }: GridCardProps) {
  const remaining = Math.max(project.fundingGoal - project.fundingRaised, 0);
  const donateHref = `/donate?project=${encodeURIComponent(project.id)}`;
  return (
    <Tag
      aria-label={ariaLabel}
      className="group relative flex flex-col bg-ground-2 shape-bevel overflow-hidden shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <span aria-hidden="true" className="program-ribbon" data-status={flags.ribbonStatus}>
        {flags.ribbonLabel}
      </span>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ground-3">
        <Image
          src={project.heroImage.src}
          alt={project.heroImage.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-balance text-heading-5 text-ink">{project.title}</h3>
        <p className="line-clamp-2 text-body-sm text-ink-2">{project.summary}</p>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <ProgressBar
            percentage={flags.percentage}
            label={
              flags.isFunded
                ? "Fully funded"
                : flags.isPaused
                  ? "Paused"
                  : `${flags.percentage}% · ${dollarsCompact.format(remaining)} to go`
            }
            tone={flags.progressTone}
          />
          {flags.isFunded ? (
            <Link
              href="/projects"
              className="inline-flex min-h-[44px] items-center justify-center border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
            >
              See Outcome
            </Link>
          ) : (
            <Link
              href={donateHref}
              className="inline-flex min-h-[44px] items-center justify-center bg-accent-2 px-4 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
            >
              Donate Now
            </Link>
          )}
        </div>
      </div>
    </Tag>
  );
}

type CardProps = {
  project: Project;
  flags: Computed;
  ariaLabel: string;
};

function FeatureCard({ project, flags, ariaLabel }: CardProps) {
  const meta = buildMetaLine(project);
  return (
    <div className="relative">
      <span aria-hidden="true" className="program-ribbon" data-status={flags.ribbonStatus}>
        {flags.ribbonLabel}
      </span>
      <Feature ariaLabel={ariaLabel} className="pt-2">
        {/* spacer so the ribbon (translateY -0.375rem) doesn't collide with breakout image */}
        <Reveal kind="develop">
          <Feature.Image
            src={project.heroImage.src}
            alt={project.heroImage.alt}
            aspect="3/2"
            bleed
            priority
          />
        </Reveal>
        <Feature.Body>
          {meta ? <Feature.Eyebrow>{meta}</Feature.Eyebrow> : null}
          <Feature.Headline as="h3" href="/projects">
            {project.title}
          </Feature.Headline>
          <Feature.Lede>{project.summary}</Feature.Lede>
          {project.body && !isPlaceholder(project.body) ? (
            <p className="max-w-[60ch] text-body text-ink-2">{project.body}</p>
          ) : null}
          <ProgressBar
            percentage={flags.percentage}
            label={flags.progressLabel}
            tone={flags.progressTone}
          />
          {project.mathLineItem ? <Feature.Stamp>{project.mathLineItem}</Feature.Stamp> : null}
          {flags.pausedStamp && !project.mathLineItem ? (
            <Feature.Stamp>{flags.pausedStamp}</Feature.Stamp>
          ) : null}
        </Feature.Body>
      </Feature>
    </div>
  );
}

function buildMetaLine(project: Project): string | null {
  const parts: string[] = [];
  if (project.boardOwnerName) parts.push(`Owner · ${project.boardOwnerName}`);
  if (project.lastUpdated) {
    try {
      parts.push(`Updated ${relativeTime(new Date(project.lastUpdated))}`);
    } catch {
      // Keep prose intact when date is unparseable.
    }
  }
  return parts.length > 0 ? parts.join("  ·  ") : null;
}

type RowCardProps = CardProps & {
  as: "article" | "li";
  hideRule: boolean;
};

function RowCard({ project, flags, as, hideRule, ariaLabel }: RowCardProps) {
  const meta = buildMetaLine(project);
  return (
    <Row as={as} hideRule={hideRule} ariaLabel={ariaLabel}>
      <span aria-hidden="true" className="program-ribbon" data-status={flags.ribbonStatus}>
        {flags.ribbonLabel}
      </span>
      <Reveal kind="develop">
        <Row.Image src={project.heroImage.src} alt={project.heroImage.alt} aspect="4/3" />
      </Reveal>
      <Row.Body>
        {meta ? <Row.Eyebrow>{meta}</Row.Eyebrow> : null}
        <Row.Headline href="/projects">{project.title}</Row.Headline>
        <Row.Lede>{project.summary}</Row.Lede>
        <ProgressBar
          percentage={flags.percentage}
          label={flags.progressLabel}
          tone={flags.progressTone}
        />
        {project.mathLineItem ? <Row.Stamp>{project.mathLineItem}</Row.Stamp> : null}
        {flags.pausedStamp && !project.mathLineItem ? (
          <Row.Stamp>{flags.pausedStamp}</Row.Stamp>
        ) : null}
      </Row.Body>
    </Row>
  );
}
