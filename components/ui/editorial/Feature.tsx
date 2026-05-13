import Image from "next/image";
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";

type Aspect = "1/1" | "3/2" | "4/5" | "5/6" | "16/9";

const aspectClass: Record<Aspect, string> = {
  "1/1": "aspect-[1/1]",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "5/6": "aspect-[5/6]",
  "16/9": "aspect-[16/9]",
};

type FeatureProps = {
  children: ReactNode;
  /**
   * `true`  → asymmetric 5fr/7fr grid with `lg:-ml-[6%]` image bleed (Browser
   *           Company release-note silhouette). Use as the lede of an index.
   * `false` → centered single column with image full-bleed above. Use for
   *           single-dominant-story surfaces or text-only Features.
   */
  breakout?: boolean;
  className?: string;
  ariaLabel?: string;
};

function FeatureRoot({ children, breakout = true, className, ariaLabel }: FeatureProps) {
  const layout = breakout
    ? "relative grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-14"
    : "relative flex flex-col gap-6";
  const merged = `${layout} ${className ?? ""}`.trim();
  return (
    <article className={merged} aria-label={ariaLabel}>
      {children}
    </article>
  );
}

type FeatureImageProps = {
  src: string;
  alt: string;
  aspect?: Aspect;
  sizes?: string;
  /**
   * In breakout layouts, lets the image bleed left of the column edge for a
   * Pentagram-style scale-of-importance gesture.
   */
  bleed?: boolean;
  priority?: boolean;
  /**
   * Pair the image with a same-named element on another route so the browser
   * crossfades it during navigation (CSS view-transitions). Names must be
   * unique per page — only one rendered Feature.Image on a given route should
   * carry a name. R4.9 uses this for the success-stories featured portrait
   * crossfading into the slug PortraitHero.
   */
  viewTransitionName?: string;
};

function FeatureImage({
  src,
  alt,
  aspect = "4/5",
  sizes,
  bleed = false,
  priority,
  viewTransitionName,
}: FeatureImageProps) {
  const bleedClass = bleed ? "lg:-ml-[6%]" : "";
  return (
    <div
      className={`relative w-full overflow-hidden bg-ground-3 ${aspectClass[aspect]} ${bleedClass}`.trim()}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        // Next.js 16: `priority` injects a <link rel="preload"> but does not
        // emit fetchpriority="high" on the rendered <img>. The Lighthouse /
        // DevTools LCP-discovery insight checks the img's fetchpriority — so
        // pair the two whenever the caller marks an image priority.
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes ?? "(min-width: 1024px) 40vw, 100vw"}
        className="object-cover"
      />
    </div>
  );
}

type FeatureBodyProps = {
  children: ReactNode;
  className?: string;
};

function FeatureBody({ children, className }: FeatureBodyProps) {
  return <div className={`flex flex-col gap-5 ${className ?? ""}`}>{children}</div>;
}

type FeatureEyebrowProps = {
  children: ReactNode;
};

function FeatureEyebrow({ children }: FeatureEyebrowProps) {
  return <p className="text-meta uppercase tracking-[0.08em] text-ink-2">{children}</p>;
}

type FeatureHeadlineProps = {
  href?: string;
  children: ReactNode;
  as?: "h2" | "h3";
  cardClickable?: boolean;
};

function FeatureHeadline({
  href,
  children,
  as: Heading = "h3",
  cardClickable = true,
}: FeatureHeadlineProps) {
  if (!href) {
    return <Heading className="text-balance text-display-2 text-ink">{children}</Heading>;
  }
  const linkExtension = cardClickable ? "after:absolute after:inset-0 after:content-['']" : "";
  return (
    <Heading className="text-balance text-display-2 text-ink">
      <Link
        href={href}
        className={`group/link inline-block transition-colors duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-accent-2-text focus-visible:text-accent-2-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent ${linkExtension}`.trim()}
      >
        {children}
      </Link>
    </Heading>
  );
}

type FeatureLedeProps = {
  children: ReactNode;
};

function FeatureLede({ children }: FeatureLedeProps) {
  return <p className="max-w-[60ch] text-body-lg text-ink-2">{children}</p>;
}

type FeatureStampProps = {
  children: ReactNode;
};

function FeatureStamp({ children }: FeatureStampProps) {
  return <p className="text-meta uppercase tracking-[0.04em] text-ink-2">{children}</p>;
}

export const Feature = Object.assign(FeatureRoot, {
  Image: FeatureImage,
  Body: FeatureBody,
  Eyebrow: FeatureEyebrow,
  Headline: FeatureHeadline,
  Lede: FeatureLede,
  Stamp: FeatureStamp,
});
