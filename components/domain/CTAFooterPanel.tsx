import { Button } from "@/components/ui/Button";

type CTAFooterPanelProps = {
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  tone?: "cream" | "teal";
  titleId?: string;
  id?: string;
};

export function CTAFooterPanel({
  headline,
  body,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  tone = "cream",
  titleId = "cta-footer-title",
  id,
}: CTAFooterPanelProps) {
  const isTeal = tone === "teal";
  const surfaceClass = isTeal ? "teal-panel text-white" : "bg-ground text-ink";
  const bodyClass = isTeal ? "text-white/80" : "text-ink-2";

  return (
    <section
      aria-labelledby={titleId}
      {...(id ? { id } : {})}
      className={`${surfaceClass} py-24 lg:py-[140px]${id ? " scroll-mt-20" : ""}`}
    >
      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-start gap-8 px-4 sm:px-6 lg:px-[6%]">
        <h2 id={titleId} className="text-balance text-display-2">
          {headline}
        </h2>
        <p className={`max-w-[56ch] text-body-lg ${bodyClass}`}>{body}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" href={ctaHref}>
            {ctaLabel}
          </Button>
          {secondaryCtaLabel && secondaryCtaHref ? (
            <Button variant="secondary" href={secondaryCtaHref}>
              {secondaryCtaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
