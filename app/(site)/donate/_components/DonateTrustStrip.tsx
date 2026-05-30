import { getTranslations } from "next-intl/server";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

const EIN_PLACEHOLDER = "00-0000000";

export type TransactionSource = "stripe" | "givebutter" | "mailto" | "placeholder";

type DonateTrustStripProps = {
  ein: string;
  contactEmail: string;
  transactionSource: TransactionSource;
};

export async function DonateTrustStrip({
  ein,
  contactEmail,
  transactionSource,
}: DonateTrustStripProps) {
  const t = await getTranslations("donatePageExtra");
  const showEin = !isPlaceholder(ein) && ein !== EIN_PLACEHOLDER;
  // Fallback path = transaction source is not live (i.e. not stripe / givebutter).
  const showFallbackPath = transactionSource === "mailto" || transactionSource === "placeholder";

  return (
    <section aria-labelledby="donate-trust-title" className="bg-ground px-4 sm:px-6 lg:px-[6%]">
      <div className="mx-auto max-w-[900px] border-t border-hairline">
        <h2 id="donate-trust-title" className="sr-only">
          {t("trustStripHeading")}
        </h2>
        <dl className="divide-y divide-hairline">
          <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
            <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
              {t("trustNonprofitLabel")}
            </dt>
            <dd className="text-body-lg text-ink">{t("trustNonprofitBody")}</dd>
          </div>
          {showEin ? (
            <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
              <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
                {t("trustEinLabel")}
              </dt>
              <dd className="font-mono text-body-lg text-ink">{ein}</dd>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
            <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
              {t("trustResponseLabel")}
            </dt>
            <dd className="text-body-lg text-ink">{t("trustResponseBody")}</dd>
          </div>
          {showFallbackPath ? (
            <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
              <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
                {t("trustFallbackLabel")}
              </dt>
              <dd className="text-body-lg text-ink">
                {t.rich("trustFallbackBody", {
                  email: () => (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
                    >
                      {contactEmail}
                    </a>
                  ),
                })}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
