import type { Metadata } from "next";
import { StoryToc } from "@/components/content/StoryToc";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionAct } from "@/components/ui/SectionAct";
import { extractHeadings } from "@/lib/content/extractHeadings";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { getTermsPage } from "@/lib/content/termsPage";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { TermsBody } from "./_components/TermsBody";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Legal baseline for Bridging Generations: terms of use, privacy note, copyright, and nonprofit disclosures.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormatter.format(d);
}

export default async function TermsPage() {
  const [terms, siteSettings] = await Promise.all([getTermsPage(), getSiteSettings()]);
  const body = await terms.body();
  const headings = extractHeadings(body, [2]);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Terms", url: "/terms" },
  ]);

  return (
    <>
      <section
        aria-labelledby="terms-hero-title"
        className="bg-ground px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-16"
      >
        <Reveal>
          <div className="mx-auto flex max-w-[65ch] flex-col gap-4">
            <Eyebrow>Legal</Eyebrow>
            <h1 id="terms-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
              Terms &amp; Conditions.
            </h1>
            {terms.lastUpdated ? (
              <p className="text-meta uppercase tracking-[0.1em] text-ink-2">
                Last updated: {formatDate(terms.lastUpdated)}
              </p>
            ) : null}
          </div>
        </Reveal>
      </section>
      <section
        aria-labelledby="terms-body-title"
        className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
      >
        <h2 id="terms-body-title" className="sr-only">
          Terms body
        </h2>
        <div className="longform-spine">
          <StoryToc headings={headings} />
          <SectionAct>
            <TermsBody source={body} />
          </SectionAct>
        </div>
      </section>
      <section
        aria-labelledby="terms-contact-title"
        className="bg-ground-2 px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
      >
        <div className="mx-auto flex max-w-[65ch] flex-col gap-3 text-body text-ink-2">
          <h2
            id="terms-contact-title"
            className="text-eyebrow uppercase tracking-[0.1em] text-accent"
          >
            Get in touch
          </h2>
          <p>
            Questions about these terms? Email{" "}
            <a
              href={`mailto:${siteSettings.contactEmail}`}
              className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
            >
              {siteSettings.contactEmail}
            </a>
            .
          </p>
        </div>
      </section>
      <JsonLd id="ld-terms-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
