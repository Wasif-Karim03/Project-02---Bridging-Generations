import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

type DonateHeroProps = {
  headline: string;
  intro: string;
  ein: string;
  orgName: string;
};

export function DonateHero({ headline, intro, ein, orgName }: DonateHeroProps) {
  const einIsReal = !isPlaceholder(ein) && ein !== "00-0000000";
  return (
    <Reveal>
      <div className="flex flex-col gap-5">
        <Eyebrow>Give</Eyebrow>
        <h1 className="text-balance text-display-2 text-ink">{headline}</h1>
        <p className="max-w-[44ch] text-body-lg text-ink-2">{intro}</p>
        <dl className="mt-2 flex flex-col gap-1 text-meta uppercase tracking-[0.1em] text-ink-2">
          <div className="flex gap-2">
            <dt className="sr-only">Organization</dt>
            <dd>{orgName}</dd>
          </div>
          {einIsReal ? (
            <div className="flex gap-2">
              <dt>501(c)(3)</dt>
              <dd className="tabular-nums">EIN {ein}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Reveal>
  );
}
