import { Link } from "next-view-transitions";
import { Accordion } from "@/components/ui/Accordion";
import { footerContent } from "@/content/fixtures/footer";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

const EIN_PLACEHOLDER = "00-0000000";

type FooterProps = {
  ein?: string;
  mailingAddress?: string;
  tagline?: string;
  contactEmail?: string;
  form990Url?: string;
  candidProfileUrl?: string;
  socialLinks?: {
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
  };
};

export function Footer({
  ein,
  mailingAddress,
  tagline,
  contactEmail,
  form990Url,
  candidProfileUrl,
  socialLinks,
}: FooterProps = {}) {
  const { brand, explore, copyrightNote, legalLinks } = footerContent;
  const year = new Date().getFullYear();
  const einHasRealValue = !isPlaceholder(ein) && ein !== EIN_PLACEHOLDER;
  const showMailingAddress = !isPlaceholder(mailingAddress);
  const showImprint = einHasRealValue || showMailingAddress;
  const showTransparency = Boolean(form990Url) || Boolean(candidProfileUrl);
  const hasAnySocial = Boolean(
    socialLinks?.instagram ||
      socialLinks?.facebook ||
      socialLinks?.linkedin ||
      socialLinks?.youtube,
  );

  return (
    <div className="bg-accent text-white">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[3fr_5fr_2fr] lg:gap-16 lg:px-[6%] lg:py-14">
        <div>
          <p className="text-heading-6 font-bold">{brand.name}</p>
          {tagline ? <p className="mt-3 text-body-sm text-white">{tagline}</p> : null}
          {showImprint ? (
            <div className="mt-6 border-t border-white/15 pt-6">
              {showMailingAddress ? (
                <address className="whitespace-pre-line text-meta not-italic text-white">
                  {mailingAddress}
                </address>
              ) : null}
              {einHasRealValue ? (
                <p className="mt-3 text-meta uppercase tracking-[0.02em] text-white">
                  501(c)(3) · EIN <span className="tabular-nums">{ein}</span> · Tax-deductible
                </p>
              ) : null}
            </div>
          ) : null}
          {showTransparency ? (
            <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-meta text-white">
              {form990Url ? (
                <li>
                  <a
                    href={form990Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-[3px] transition-colors hover:text-accent-3 hover:no-underline active:text-accent-3 active:no-underline"
                  >
                    Form 990
                  </a>
                </li>
              ) : null}
              {candidProfileUrl ? (
                <li>
                  <a
                    href={candidProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-[3px] transition-colors hover:text-accent-3 hover:no-underline active:text-accent-3 active:no-underline"
                  >
                    Candid profile
                  </a>
                </li>
              ) : null}
            </ul>
          ) : null}
          {hasAnySocial ? (
            <ul className="mt-6 flex items-center gap-2 border-t border-white/15 pt-6">
              {socialLinks?.instagram ? (
                <li>
                  <a
                    aria-label="Instagram"
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    <InstagramMark />
                  </a>
                </li>
              ) : null}
              {socialLinks?.facebook ? (
                <li>
                  <a
                    aria-label="Facebook"
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    <FacebookMark />
                  </a>
                </li>
              ) : null}
              {socialLinks?.linkedin ? (
                <li>
                  <a
                    aria-label="LinkedIn"
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    <LinkedInMark />
                  </a>
                </li>
              ) : null}
              {socialLinks?.youtube ? (
                <li>
                  <a
                    aria-label="YouTube"
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    <YouTubeMark />
                  </a>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
        {/* <sm: stacked accordion clusters in a single column. sm+: split into two grid columns. */}
        <div className="sm:hidden">
          <Accordion
            summary="Explore"
            defaultOpen
            className="border-white/15 [&>summary]:text-accent-3"
          >
            <ul className="flex flex-col gap-2 text-body-sm">
              {explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Accordion>
          {contactEmail ? (
            <Accordion summary="Contact" className="border-white/15 [&>summary]:text-accent-3">
              <ul className="flex flex-col gap-2 text-body-sm">
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    Email us
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white transition-colors hover:text-accent-3 active:text-accent-3"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </Accordion>
          ) : null}
        </div>
        <div className="hidden sm:block">
          <p className="text-eyebrow uppercase text-accent-3">Explore</p>
          <ul className="mt-4 flex flex-col gap-2 text-body-sm lg:block lg:columns-2 lg:gap-x-12 lg:space-y-2">
            {explore.map((link) => (
              <li key={link.href} className="lg:break-inside-avoid">
                <Link
                  href={link.href}
                  className="text-white transition-colors hover:text-accent-3 active:text-accent-3"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {contactEmail ? (
          <div className="hidden sm:block">
            <p className="text-eyebrow uppercase text-accent-3">Contact</p>
            <ul className="mt-4 flex flex-col gap-2 text-body-sm">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-white transition-colors hover:text-accent-3 active:text-accent-3"
                >
                  Email us
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white transition-colors hover:text-accent-3 active:text-accent-3"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-meta text-white sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-2 sm:px-6 lg:px-[6%]">
          <p>
            © {year} {copyrightNote}
          </p>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <ul className="flex gap-3">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-accent-3 active:text-accent-3"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InstagramMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
