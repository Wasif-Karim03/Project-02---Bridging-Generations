import Image from "next/image";
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";

type Aspect = "1/1" | "3/2" | "4/3" | "4/5" | "5/6" | "16/9";

const aspectClass: Record<Aspect, string> = {
  "1/1": "aspect-[1/1]",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "5/6": "aspect-[5/6]",
  "16/9": "aspect-[16/9]",
};

type RowProps = {
  as?: "article" | "li";
  children: ReactNode;
  className?: string;
  hideRule?: boolean;
  /**
   * Drop the 3fr/9fr image grid when the row carries no `<Row.Image>` —
   * collapses to a single-column flex stack. Used by text-only contexts
   * (anonymous donor messages, testimonials without portraits).
   */
  noImage?: boolean;
  ariaLabel?: string;
};

function RowRoot({
  as: Tag = "article",
  children,
  className,
  hideRule = false,
  noImage = false,
  ariaLabel,
}: RowProps) {
  const layout = noImage
    ? "flex flex-col gap-3 py-7 lg:py-9"
    : "grid grid-cols-1 gap-5 py-7 sm:grid-cols-[3fr_9fr] sm:gap-8 lg:py-9";
  const base = `group relative ${layout}`;
  const rule = hideRule ? "" : "border-t border-hairline";
  const merged = `${base} ${rule} ${className ?? ""}`.trim();
  return (
    <Tag className={merged} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}

type RowImageProps = {
  src: string;
  alt: string;
  aspect?: Aspect;
  sizes?: string;
  /**
   * Mark the LCP card on a route. Adds `priority` (preload) and
   * `fetchPriority="high"` to the underlying <Image>. Use sparingly — only
   * the first above-the-fold card per route.
   */
  priority?: boolean;
};

function RowImage({ src, alt, aspect = "3/2", sizes, priority }: RowImageProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-ground-3 ${aspectClass[aspect]}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes ?? "(min-width: 640px) 25vw, 100vw"}
        className="object-cover transition-[filter] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:saturate-[1.04] motion-safe:group-focus-within:saturate-[1.04] motion-safe:group-active:saturate-[1.04]"
      />
    </div>
  );
}

type RowBodyProps = {
  children: ReactNode;
  className?: string;
};

function RowBody({ children, className }: RowBodyProps) {
  return <div className={`flex flex-col gap-3 ${className ?? ""}`}>{children}</div>;
}

type RowEyebrowProps = {
  children: ReactNode;
};

function RowEyebrow({ children }: RowEyebrowProps) {
  return <p className="text-meta uppercase tracking-[0.08em] text-ink-2">{children}</p>;
}

type RowHeadlineProps = {
  href?: string;
  children: ReactNode;
  as?: "h2" | "h3" | "h4";
  /**
   * When true (and href is set), the headline link's ::after extends the click
   * region to the whole row (Heydon Pickering "redundant click region"). Only
   * the headline stays in the keyboard tab order. Trade-off: text selection
   * within the row is impaired since ::after captures pointer events.
   */
  cardClickable?: boolean;
};

function RowHeadline({
  href,
  children,
  as: Heading = "h3",
  cardClickable = true,
}: RowHeadlineProps) {
  if (!href) {
    return <Heading className="text-balance text-heading-4 text-ink">{children}</Heading>;
  }
  const linkExtension = cardClickable ? "after:absolute after:inset-0 after:content-['']" : "";
  return (
    <Heading className="text-balance text-heading-4 text-ink">
      <Link
        href={href}
        className={`group/link inline-block transition-colors duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-accent-2-text focus-visible:text-accent-2-text active:text-accent-2-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent ${linkExtension}`.trim()}
      >
        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:bg-[length:100%_1px] group-focus-visible/link:bg-[length:100%_1px] group-active/link:bg-[length:100%_1px]">
          {children}
        </span>
      </Link>
    </Heading>
  );
}

type RowLedeProps = {
  children: ReactNode;
};

function RowLede({ children }: RowLedeProps) {
  return <p className="max-w-[60ch] text-body text-ink-2">{children}</p>;
}

type RowStampProps = {
  children: ReactNode;
};

function RowStamp({ children }: RowStampProps) {
  return <p className="text-meta uppercase tracking-[0.04em] text-ink-2">{children}</p>;
}

export const Row = Object.assign(RowRoot, {
  Image: RowImage,
  Body: RowBody,
  Eyebrow: RowEyebrow,
  Headline: RowHeadline,
  Lede: RowLede,
  Stamp: RowStamp,
});
