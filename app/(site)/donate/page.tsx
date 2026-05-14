import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqAccordion } from "@/components/domain/FaqAccordion";
import { TestimonialPanel } from "@/components/domain/TestimonialPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { getDonatePage } from "@/lib/content/donatePage";
import { getAllProjects } from "@/lib/content/projects";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { getAllTestimonials } from "@/lib/content/testimonials";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { DonateAfterNote } from "./_components/DonateAfterNote";
import { DonateClientArea } from "./_components/DonateClientArea";
import { DonateHero } from "./_components/DonateHero";
import { DonateTrustStrip } from "./_components/DonateTrustStrip";
import { GivingOptionsStrip } from "./_components/GivingOptionsStrip";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Sponsor a student in the Chittagong Hill Tracts. $30 a month covers tuition, books, daily meals, and materials for one child for the full school year.",
};

// Parse "15, 30, 60, 120, 250" → [15, 30, 60, 120, 250]. Filters non-numeric
// chunks and clamps to between $5 and $10,000 so admin typos don't break the form.
function parseAmounts(raw: string | null | undefined, fallback: number): number[] {
  if (!raw) return [15, 30, 60, 120, 250];
  const parsed = raw
    .split(/[,;\s]+/)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n >= 5 && n <= 10000);
  if (parsed.length === 0) return [Math.max(5, fallback), fallback * 2, fallback * 4];
  return parsed;
}

export default async function DonatePage() {
  const [donatePage, siteSettings, testimonials, projects] = await Promise.all([
    getDonatePage(),
    getSiteSettings(),
    getAllTestimonials(),
    getAllProjects(),
  ]);

  const supportTestimonial =
    testimonials.find((t) => t.speakerRole === "parent") ??
    testimonials.find((t) => t.speakerRole === "alum") ??
    testimonials[0];

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Donate", url: "/donate" },
  ]);

  const stripeReady = isStripeConfigured() && donatePage.transactionSource === "stripe";
  const transactionLive = stripeReady || donatePage.transactionSource === "givebutter";
  const afterNote = transactionLive
    ? (donatePage.afterDonateNote ?? "")
    : (donatePage.afterDonateNoteFallback ?? "");

  const monthlySuggestion = donatePage.monthlySuggestion ?? 30;
  const suggestedAmounts = parseAmounts(donatePage.suggestedAmounts, monthlySuggestion);
  const defaultAmount = suggestedAmounts.includes(monthlySuggestion)
    ? monthlySuggestion
    : (suggestedAmounts[0] ?? 30);

  return (
    <>
      <section
        aria-labelledby="donate-hero-title"
        className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div id="donate-hero-title">
            <DonateHero
              headline={donatePage.headline}
              intro={donatePage.intro}
              ein={siteSettings.ein}
              orgName={siteSettings.orgName}
            />
          </div>
          <div>
            <Suspense fallback={null}>
              <DonateClientArea
                projects={projects}
                suggestedAmounts={suggestedAmounts}
                defaultAmount={defaultAmount}
                stripeConfigured={stripeReady}
                fallbackEmail={siteSettings.contactEmail}
              />
            </Suspense>
          </div>
        </div>
      </section>
      <DonateTrustStrip
        ein={siteSettings.ein}
        contactEmail={siteSettings.contactEmail}
        transactionSource={donatePage.transactionSource}
      />
      <GivingOptionsStrip monthlySuggestion={monthlySuggestion} />
      <section
        aria-labelledby="donate-faq-title"
        className="bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto flex max-w-[900px] flex-col gap-8">
          <Reveal>
            <div className="flex flex-col gap-3">
              <Eyebrow>Answers</Eyebrow>
              <h2 id="donate-faq-title" className="text-balance text-heading-2 text-ink">
                Frequently asked questions.
              </h2>
              {donatePage.transactionSourceNote ? (
                <p className="max-w-[60ch] text-body text-ink-2">
                  {donatePage.transactionSourceNote}
                </p>
              ) : null}
            </div>
          </Reveal>
          <FaqAccordion items={donatePage.faq ?? []} />
        </div>
      </section>
      {supportTestimonial ? (
        <TestimonialPanel
          testimonial={supportTestimonial}
          titleId="donate-testimonial-title"
          ctaLabel="Meet the students"
          ctaHref="/students"
        />
      ) : null}
      <DonateAfterNote note={afterNote} />
      <StickyCTA aria-label="Donate">
        <a
          href="#donate-hero-title"
          className="inline-flex min-h-[48px] w-full items-center justify-center bg-accent-2 px-6 text-[17px] font-bold text-white shadow-[var(--shadow-cta)] transition hover:bg-accent-2-hover focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          Sponsor a student — ${monthlySuggestion}/mo
        </a>
      </StickyCTA>
      <JsonLd id="ld-donate-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
