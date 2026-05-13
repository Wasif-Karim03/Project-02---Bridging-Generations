import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { TestimonialPanel } from "@/components/domain/TestimonialPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllBoardMembers } from "@/lib/content/boardMembers";
import { isPlaceholder } from "@/lib/content/isPlaceholder";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { getAllTestimonials } from "@/lib/content/testimonials";
import { breadcrumbList, nonprofitOrganization } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { AboutHero } from "./_components/AboutHero";
import { AboutLeadership } from "./_components/AboutLeadership";
import { AboutMissionVision } from "./_components/AboutMissionVision";
import { AboutTransparency } from "./_components/AboutTransparency";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bridging Generations is a 501(c)(3) nonprofit sponsoring students across the Chittagong Hill Tracts. Meet the board and see where your donation goes.",
};

export default async function AboutPage() {
  const [siteSettings, boardMembers, testimonials] = await Promise.all([
    getSiteSettings(),
    getAllBoardMembers(),
    getAllTestimonials(),
  ]);

  const partnerQuote = testimonials.find((t) => t.speakerRole === "partner");
  const socialLinks = siteSettings.socialLinks;
  const sameAs = [
    socialLinks.instagram,
    socialLinks.facebook,
    socialLinks.linkedin,
    socialLinks.youtube,
  ].filter((s): s is string => Boolean(s));

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);
  const einIsReal = !isPlaceholder(siteSettings.ein) && siteSettings.ein !== "00-0000000";
  const mailingAddressIsReal = !isPlaceholder(siteSettings.mailingAddress);
  const ldOrg = nonprofitOrganization({
    siteUrl: SITE_URL,
    url: "/about",
    orgName: siteSettings.orgName,
    foundingDate: siteSettings.foundingYear,
    taxID: einIsReal ? siteSettings.ein : undefined,
    address: mailingAddressIsReal ? siteSettings.mailingAddress : undefined,
    email: siteSettings.contactEmail,
    sameAs,
    boardMembers: boardMembers.map((m) => ({ name: m.name, jobTitle: m.role })),
  });

  return (
    <div className="atmospheric-page">
      <AboutHero foundingYear={siteSettings.foundingYear} />
      <AboutMissionVision
        missionFull={siteSettings.missionFull}
        visionFull={siteSettings.visionFull}
      />
      <AboutTransparency
        orgName={siteSettings.orgName}
        foundingYear={siteSettings.foundingYear}
        ein={siteSettings.ein}
        form990Url={siteSettings.form990Url ?? null}
        candidProfileUrl={siteSettings.candidProfileUrl ?? null}
        mailingAddress={siteSettings.mailingAddress}
        contactEmail={siteSettings.contactEmail}
      />
      <AboutLeadership boardMembers={boardMembers} />
      {partnerQuote ? (
        <TestimonialPanel
          testimonial={partnerQuote}
          titleId="about-partner-quote-title"
          ctaLabel="Partner with us"
          ctaHref="/contact"
          id="partners"
        />
      ) : null}
      <CTAFooterPanel
        headline="Stand with us."
        body="Every sponsorship keeps one more student in the classroom. Help us carry this work into the next year."
        ctaLabel="Donate"
        ctaHref="/donate"
        tone="cream"
        titleId="about-cta-title"
        id="join"
      />
      <JsonLd id="ld-about-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-about-org" data={ldOrg} />
    </div>
  );
}
