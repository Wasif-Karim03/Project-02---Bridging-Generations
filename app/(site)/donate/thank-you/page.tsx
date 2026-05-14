import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { getDonatePage } from "@/lib/content/donatePage";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { NextStepsGrid } from "./_components/NextStepsGrid";
import { ShareRow } from "./_components/ShareRow";
import { getGiftContext, ThankYouPersonalization } from "./_components/ThankYouPersonalization";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Thank you for supporting Bridging Generations.",
  robots: { index: false, follow: false },
};

type ThankYouPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonateThankYouPage({ searchParams }: ThankYouPageProps) {
  const [donatePage, siteSettings, giftContext] = await Promise.all([
    getDonatePage(),
    getSiteSettings(),
    searchParams.then((params) => getGiftContext(params)),
  ]);

  const isLive =
    donatePage.transactionSource === "stripe" || donatePage.transactionSource === "givebutter";
  const body = isLive ? donatePage.thankYouBody : donatePage.thankYouBodyFallback;

  return (
    <>
      <section
        aria-labelledby="thank-you-hero-title"
        className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-20"
      >
        <Reveal>
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
            <h1
              id="thank-you-hero-title"
              className="max-w-[22ch] text-balance text-display-2 text-ink"
            >
              Your support changes a child's year.
            </h1>
            <p className="max-w-[60ch] whitespace-pre-line text-body-lg text-ink-2">{body}</p>
            <ThankYouPersonalization context={giftContext} />
            <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-4 text-meta uppercase tracking-[0.1em] text-ink-2">
              <li>Receipt sent</li>
              <li className="lowercase">{siteSettings.contactEmail}</li>
            </ul>
          </div>
        </Reveal>
      </section>
      <NextStepsGrid />
      {/* Mobile-only sticky share — promotes "tell a friend" from the
          12px-uppercase prose buried below the receipt to the primary
          mobile action visible on every viewport-height. */}
      <StickyCTA aria-label="Share Bridging Generations">
        <ShareRow />
      </StickyCTA>
    </>
  );
}
