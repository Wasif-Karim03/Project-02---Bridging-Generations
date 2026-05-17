import type { Metadata } from "next";
import { StoryToc } from "@/components/content/StoryToc";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionAct } from "@/components/ui/SectionAct";
import { extractHeadings } from "@/lib/content/extractHeadings";
import { getPrivacyPage } from "@/lib/content/privacyPage";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { PrivacyBody } from "./_components/PrivacyBody";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Bridging Generations collects, uses, and protects donor + student data — written in plain language. Covers payment processing, account management, email, and your rights to access or delete your information.",
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

// Mirrors the /terms route in structure + chrome: hero + spine layout with
// auto-generated table of contents from h2 headings + a contact-us footer.
// Content lives in content/privacy-page/index.mdx, editable from /keystatic.
export default async function PrivacyPage() {
  const [privacy, siteSettings] = await Promise.all([getPrivacyPage(), getSiteSettings()]);
  const body = await privacy.body();
  const headings = extractHeadings(body, [2]);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Privacy policy", url: "/privacy" },
  ]);

  return (
    <>
      <section
        aria-labelledby="privacy-hero-title"
        className="bg-ground px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-16"
      >
        <Reveal>
          <div className="mx-auto flex max-w-[65ch] flex-col gap-4">
            <Eyebrow>Legal</Eyebrow>
            <h1
              id="privacy-hero-title"
              className="max-w-[22ch] text-balance text-display-2 text-ink"
            >
              Privacy policy.
            </h1>
            {privacy.lastUpdated ? (
              <p className="text-meta uppercase tracking-[0.1em] text-ink-2">
                Last updated: {formatDate(privacy.lastUpdated)}
              </p>
            ) : null}
          </div>
        </Reveal>
      </section>
      <section
        aria-labelledby="privacy-body-title"
        className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
      >
        <h2 id="privacy-body-title" className="sr-only">
          Privacy body
        </h2>
        <div className="longform-spine">
          <StoryToc headings={headings} />
          <SectionAct>
            <PrivacyBody source={body} />
          </SectionAct>
        </div>
      </section>
      <section
        aria-labelledby="privacy-contact-title"
        className="bg-ground-2 px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
      >
        <div className="mx-auto flex max-w-[65ch] flex-col gap-3 text-body text-ink-2">
          <h2
            id="privacy-contact-title"
            className="text-eyebrow uppercase tracking-[0.1em] text-accent"
          >
            Privacy questions
          </h2>
          <p>
            For data access, deletion, or correction requests, email{" "}
            <a
              href={`mailto:${siteSettings.contactEmail}`}
              className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
            >
              {siteSettings.contactEmail}
            </a>{" "}
            or use the{" "}
            <a
              href="/contact"
              className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
            >
              contact form
            </a>
            . We respond to data-rights requests within 30 days.
          </p>
        </div>
      </section>
      <JsonLd id="ld-privacy-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
