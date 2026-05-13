import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgressRule } from "@/components/layout/ScrollProgressRule";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getSiteSettings } from "@/lib/content/siteSettings";

// Site chrome (Nav, main, Footer + scroll behaviors). Used by the (site)
// route-group layout AND by the global app/not-found.tsx so the 404 page
// keeps the same chrome without duplicating server-fetch logic.
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();
  return (
    <>
      <ScrollProgressRule />
      <SmoothScroll />
      <SkipLink />
      <header>
        <Nav
          contactEmail={siteSettings.contactEmail}
          phoneNumber={siteSettings.phoneNumber ?? undefined}
          whatsappNumber={siteSettings.whatsappNumber ?? undefined}
        />
      </header>
      {/* pt-14 (56px) is the nav height; contact strip adds 36px at lg+ */}
      <main id="main-content" tabIndex={-1} className="flex-1 pt-14 outline-none lg:pt-[5.75rem]">
        {children}
      </main>
      <footer>
        <Footer
          ein={siteSettings.ein}
          mailingAddress={siteSettings.mailingAddress}
          tagline={siteSettings.copy.footerTagline}
          contactEmail={siteSettings.contactEmail}
          secondaryEmail={siteSettings.secondaryEmail ?? undefined}
          phoneNumber={siteSettings.phoneNumber ?? undefined}
          whatsappNumber={siteSettings.whatsappNumber ?? undefined}
          form990Url={siteSettings.form990Url || undefined}
          candidProfileUrl={siteSettings.candidProfileUrl || undefined}
          socialLinks={siteSettings.socialLinks}
        />
      </footer>
    </>
  );
}
