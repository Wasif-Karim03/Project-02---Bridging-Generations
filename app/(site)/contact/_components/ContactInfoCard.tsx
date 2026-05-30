import { getTranslations } from "next-intl/server";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

type ContactInfoCardProps = {
  mailingAddress: string;
  contactEmail: string;
  responseNote: string;
};

export async function ContactInfoCard({
  mailingAddress,
  contactEmail,
  responseNote,
}: ContactInfoCardProps) {
  const t = await getTranslations("contactPageExtra");
  const showAddress = !isPlaceholder(mailingAddress);
  return (
    <aside aria-label="Direct contact details" className="flex flex-col">
      <dl className="border-t border-hairline">
        <div className="grid grid-cols-1 gap-2 border-b border-hairline py-5 lg:py-6">
          <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">{t("emailLabel")}</dt>
          <dd>
            <a
              href={`mailto:${contactEmail}`}
              className="break-words text-body-lg text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
            >
              {contactEmail}
            </a>
          </dd>
        </div>
        {showAddress ? (
          <div className="grid grid-cols-1 gap-2 border-b border-hairline py-5 lg:py-6">
            <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
              {t("mailingAddressLabel")}
            </dt>
            <dd>
              <address className="whitespace-pre-line break-words not-italic text-body text-ink-2">
                {mailingAddress}
              </address>
            </dd>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-2 border-b border-hairline py-5 lg:py-6">
          <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
            {t("responseTimeLabel")}
          </dt>
          <dd>
            <p className="text-body text-ink-2">{responseNote}</p>
          </dd>
        </div>
      </dl>
    </aside>
  );
}
