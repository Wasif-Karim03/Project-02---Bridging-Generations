"use client";

import Script from "next/script";
import { createElement, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

type GivebutterEmbedProps = {
  accountId: string;
  campaignId: string;
};

function SetupFallback() {
  return (
    <div className="flex flex-col gap-4 border-t border-hairline pt-6">
      <Eyebrow>Setup pending</Eyebrow>
      <p className="max-w-[42ch] text-body-lg text-ink-2">
        Gifts are routed by hand while we stand up the Givebutter campaign — every contribution is
        confirmed and routed personally within two business days.
      </p>
      <p>
        <a
          href="mailto:info@bridginggenerations.org?subject=I%27d%20like%20to%20donate"
          className="break-all text-heading-4 text-accent underline decoration-2 underline-offset-[4px] transition hover:text-accent-2-text focus-visible:text-accent-2-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          info@bridginggenerations.org
        </a>
      </p>
    </div>
  );
}

export function GivebutterEmbed({ accountId, campaignId }: GivebutterEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  // Both values must be real Givebutter dashboard values — accountId (acct= in
  // the widget script URL) and campaignId (<givebutter-widget id>). If either
  // is a [CONFIRM:] stub the widget-core script would error in the console and
  // render nothing, so we show an honest email-us CTA instead.
  const accountReady = accountId && !isPlaceholder(accountId);
  const campaignReady = campaignId && !isPlaceholder(campaignId);
  if (!accountReady || !campaignReady) {
    return <SetupFallback />;
  }

  const scriptSrc = `https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(
    accountId,
  )}&p=other`;

  return (
    <div className="relative min-h-[480px] bg-ground-2 sm:min-h-[560px]">
      {!loaded ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col gap-4 p-6 motion-safe:animate-pulse"
        >
          <div className="h-8 w-1/2 bg-ground-3" />
          <div className="h-24 w-full bg-ground-3" />
          <div className="h-12 w-3/4 bg-ground-3" />
          <div className="h-12 w-3/4 bg-ground-3" />
          <div className="mt-auto h-12 w-full bg-ground-3" />
        </div>
      ) : null}
      <Script src={scriptSrc} strategy="afterInteractive" onLoad={() => setLoaded(true)} />
      {createElement("givebutter-widget", { id: campaignId, className: "block w-full" })}
      <noscript>
        <p className="p-6 text-body text-ink-2">
          Donations require JavaScript. If you'd rather give by check, email{" "}
          <a
            href="mailto:info@bridginggenerations.org"
            className="text-accent underline underline-offset-[3px]"
          >
            info@bridginggenerations.org
          </a>
          .
        </p>
      </noscript>
    </div>
  );
}
