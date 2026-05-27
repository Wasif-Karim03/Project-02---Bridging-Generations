import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireRole } from "@/lib/auth";
import { buildFinancialSummary, listManualDonations } from "@/lib/db/queries/manualDonations";
import { FinancialSummary } from "./_components/FinancialSummary";

export const metadata: Metadata = {
  title: "Accountant dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Accountant dashboard. requireRole gates by both status (active) and role
// (accountant or above). Two panels:
//   1. Spreadsheet-style table of manual donation entries
//   2. Financial summary (totals + per-month + per-donor + per-student)
// + a CTA to record a new donation. The Calculate button is inside the
// FinancialSummary client component so the summary stays static-by-default
// (faster initial render) and only crunches when the accountant asks.
type Search = { calc?: string };
export default async function AccountantDashboard({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireRole("accountant");
  const { calc } = await searchParams;
  const showSummary = calc === "1";

  const [entries, summary] = await Promise.all([
    listManualDonations(),
    showSummary ? buildFinancialSummary() : Promise.resolve(null),
  ]);

  const totalCentsAllTime = entries.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Accountant workspace</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Donations ledger.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Record gifts received outside the online donation flow — bank transfer, cash, in-kind. Use
          the <strong>Calculate</strong> button to roll the ledger into a financial summary you can
          share with the board.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Entries on file" value={String(entries.length)} />
        <Stat label="All-time total" value={currency.format(totalCentsAllTime / 100)} />
        <Stat
          label="Most recent gift"
          value={entries[0] ? dateFormatter.format(entries[0].occurredAt) : "—"}
        />
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/accountant/donations/new"
          className="inline-flex min-h-[48px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
        >
          Record a donation →
        </Link>
        <Link
          href={showSummary ? "/dashboard/accountant" : "/dashboard/accountant?calc=1"}
          className="inline-flex min-h-[48px] items-center border border-hairline px-5 text-nav-link uppercase text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {showSummary ? "Hide summary" : "Calculate summary"}
        </Link>
      </section>

      {showSummary && summary ? <FinancialSummary summary={summary} /> : null}

      <section aria-labelledby="ledger-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="ledger-title" className="text-heading-3 text-ink">
            Ledger
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </header>
        {entries.length === 0 ? (
          <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
            No entries yet. Record the first gift using the button above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Date</th>
                  <th className="py-3 pr-4 text-left">Donor</th>
                  <th className="py-3 pr-4 text-left">Student</th>
                  <th className="py-3 pr-4 text-left">Method</th>
                  <th className="py-3 pr-4 text-right">Amount</th>
                  <th className="py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={e.occurredAt.toISOString()}>
                        {dateFormatter.format(e.occurredAt)}
                      </time>
                    </td>
                    <td className="py-3 pr-4 align-top text-ink">
                      {e.donorName ?? e.donorEmail ?? "(unknown)"}
                    </td>
                    <td className="py-3 pr-4 align-top text-ink-2">
                      {e.studentSlug ?? "(unassigned)"}
                    </td>
                    <td className="py-3 pr-4 align-top text-ink-2">{e.method}</td>
                    <td className="py-3 pr-4 text-right align-top tabular-nums text-ink">
                      {currency.format(e.amountCents / 100)}
                    </td>
                    <td className="py-3 align-top text-body-sm text-ink-2">{e.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-display-3 tabular-nums text-ink">{value}</p>
    </div>
  );
}
