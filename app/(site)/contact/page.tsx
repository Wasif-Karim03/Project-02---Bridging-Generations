import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getContactPage } from "@/lib/content/contactPage";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { ContactForm } from "./_components/ContactForm";
import { ContactInfoCard } from "./_components/ContactInfoCard";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the Bridging Generations board. We reply within two business days and use your email only to respond.",
};

export default async function ContactPage() {
  const [contactPage, siteSettings] = await Promise.all([getContactPage(), getSiteSettings()]);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  return (
    <>
      <section
        aria-labelledby="contact-hero-title"
        className="bg-ground px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-16"
      >
        <Reveal>
          <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
            <Eyebrow>Reach out</Eyebrow>
            <h1
              id="contact-hero-title"
              className="max-w-[22ch] text-balance text-display-2 text-ink"
            >
              {contactPage.headline}
            </h1>
            <p className="max-w-[60ch] text-body-lg text-ink-2">{contactPage.intro}</p>
          </div>
        </Reveal>
      </section>
      <section
        aria-labelledby="contact-form-title"
        className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <h2 id="contact-form-title" className="text-balance text-heading-3 text-ink">
              Send a message.
            </h2>
            <ContactForm />
          </div>
          <ContactInfoCard
            mailingAddress={siteSettings.mailingAddress}
            contactEmail={siteSettings.contactEmail}
            responseNote={contactPage.responseNote ?? ""}
          />
        </div>
      </section>
      <JsonLd id="ld-contact-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
