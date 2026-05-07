import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { DonorProfileForm } from "./_components/DonorProfileForm";

export const metadata: Metadata = {
  title: "Create Your Donor Profile",
  description:
    "Set up your Bridging Generations donor profile before you donate — choose a public or anonymous presence and leave a message for the students you support.",
};

export default function GivePage() {
  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Create your profile", url: "/give" },
  ]);

  return (
    <>
      <section
        aria-labelledby="give-hero-title"
        className="bg-ground px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-16"
      >
        <Reveal>
          <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
            <Eyebrow>Donor profile</Eyebrow>
            <h1 id="give-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
              Tell us about yourself.
            </h1>
            <p className="max-w-[52ch] text-body-lg text-ink-2">
              Create a short profile before you donate. Choose whether to be listed publicly or stay
              anonymous — either way, your gift reaches a student in full.
            </p>
          </div>
        </Reveal>
      </section>
      <section
        aria-labelledby="give-form-title"
        className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
      >
        <div className="mx-auto max-w-[640px] flex flex-col gap-8">
          <h2 id="give-form-title" className="text-balance text-heading-3 text-ink">
            Your details
          </h2>
          <DonorProfileForm />
        </div>
      </section>
      <JsonLd id="ld-give-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
