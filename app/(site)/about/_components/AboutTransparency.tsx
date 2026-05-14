import { ChapterBreak } from "@/components/motif/ChapterBreak";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Row } from "@/components/ui/editorial";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

type AboutTransparencyProps = {
  orgName: string;
  foundingYear: number;
  ein: string;
  form990Url: string | null;
  candidProfileUrl: string | null;
  mailingAddress: string;
  contactEmail: string;
};

export function AboutTransparency({
  orgName,
  foundingYear,
  ein,
  form990Url,
  candidProfileUrl,
  mailingAddress,
  contactEmail,
}: AboutTransparencyProps) {
  const hasAnyFinancialLink = Boolean(form990Url) || Boolean(candidProfileUrl);
  const showEin = !isPlaceholder(ein) && ein !== "00-0000000";
  const showMailingAddress = !isPlaceholder(mailingAddress);

  return (
    <section
      id="transparency"
      aria-labelledby="about-transparency-title"
      className="scroll-mt-20 bg-ground-2 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 lg:gap-14">
        <ChapterBreak />
        <div className="flex flex-col gap-4">
          <Eyebrow>Transparency</Eyebrow>
          <h2
            id="about-transparency-title"
            className="max-w-[24ch] text-balance text-heading-1 text-ink"
          >
            Where your donation goes.
          </h2>
        </div>
        <ul className="flex flex-col">
          <Row as="li" noImage className="max-sm:border-t-transparent max-sm:py-4">
            <Row.Eyebrow>Legal</Row.Eyebrow>
            <div className="flex flex-col gap-2 text-body text-ink-2">
              <span className="text-ink">{orgName}</span>
              <span>Founded {foundingYear}</span>
              <span>501(c)(3) nonprofit</span>
              {showEin ? (
                <span>
                  EIN <span className="tabular-nums">{ein}</span>
                </span>
              ) : (
                <span>EIN published once the board confirms the filing.</span>
              )}
            </div>
          </Row>
          <Row as="li" noImage className="max-sm:border-t-transparent max-sm:py-4">
            <Row.Eyebrow>Financials</Row.Eyebrow>
            <div className="flex flex-col gap-3 text-body text-ink-2">
              {hasAnyFinancialLink ? (
                <ul className="flex flex-col gap-2">
                  {form990Url ? (
                    <li>
                      <a
                        href={form990Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
                      >
                        Most recent IRS Form 990
                      </a>
                    </li>
                  ) : null}
                  {candidProfileUrl ? (
                    <li>
                      <a
                        href={candidProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
                      >
                        Candid / GuideStar profile
                      </a>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p>
                  We publish our IRS Form 990 annually. Links appear here as soon as each year's
                  filing is available.
                </p>
              )}
              <p>
                Stripe processes donations and issues automated receipts at the time of each gift.
              </p>
            </div>
          </Row>
          <Row as="li" noImage className="max-sm:border-t-transparent max-sm:py-4">
            <Row.Eyebrow>Governance</Row.Eyebrow>
            <div className="flex flex-col gap-3 text-body text-ink-2">
              {showMailingAddress ? (
                <address className="whitespace-pre-line not-italic">{mailingAddress}</address>
              ) : (
                <p>We operate remotely. Mail reaches us through the email below.</p>
              )}
              <a
                href={`mailto:${contactEmail}`}
                className="break-words text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
              >
                {contactEmail}
              </a>
              <p>The board is unpaid. 100% of project-designated donations go to program costs.</p>
            </div>
          </Row>
        </ul>
      </div>
    </section>
  );
}
