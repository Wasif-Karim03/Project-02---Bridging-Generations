import { isPlaceholder } from "@/lib/content/isPlaceholder";

const EIN_PLACEHOLDER = "00-0000000";

export type TransactionSource = "givebutter" | "mailto" | "placeholder";

type DonateTrustStripProps = {
  ein: string;
  contactEmail: string;
  transactionSource: TransactionSource;
};

export function DonateTrustStrip({ ein, contactEmail, transactionSource }: DonateTrustStripProps) {
  const showEin = !isPlaceholder(ein) && ein !== EIN_PLACEHOLDER;
  const showFallbackPath = transactionSource !== "givebutter";

  return (
    <section aria-labelledby="donate-trust-title" className="bg-ground px-4 sm:px-6 lg:px-[6%]">
      <div className="mx-auto max-w-[900px] border-t border-hairline">
        <h2 id="donate-trust-title" className="sr-only">
          About this gift
        </h2>
        <dl className="divide-y divide-hairline">
          <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
            <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">501(c)(3)</dt>
            <dd className="text-body-lg text-ink">
              Bridging Generations is a registered 501(c)(3) nonprofit. All gifts are tax-deductible
              to the extent allowed by law.
            </dd>
          </div>
          {showEin ? (
            <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
              <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">EIN</dt>
              <dd className="font-mono text-body-lg text-ink">{ein}</dd>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
            <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">Response time</dt>
            <dd className="text-body-lg text-ink">
              The board responds to gift questions within two business days.
            </dd>
          </div>
          {showFallbackPath ? (
            <div className="grid grid-cols-1 gap-2 py-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8">
              <dt className="text-meta uppercase tracking-[0.1em] text-ink-2">
                While we're set up
              </dt>
              <dd className="text-body-lg text-ink">
                The Givebutter campaign is being stood up. In the meantime, write to{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
                >
                  {contactEmail}
                </a>{" "}
                — the board confirms receipt and routes the gift by hand.
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
