import type { FinancialSummary as Summary } from "@/lib/db/queries/manualDonations";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Read-only summary panel rendered when the accountant clicks Calculate.
// Three breakdowns side by side: per-month, per-donor, per-student.
// All amounts in cents internally; converted to dollars at the edge.
export function FinancialSummary({ summary }: { summary: Summary }) {
  return (
    <section
      aria-labelledby="summary-title"
      className="flex flex-col gap-6 border-2 border-accent bg-accent/5 p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
        <h2 id="summary-title" className="text-heading-3 text-ink">
          Financial summary
        </h2>
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
          {summary.count} gifts · {currency.format(summary.totalCents / 100)} total
        </span>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <PanelTable
          title="By month"
          rows={summary.perMonth.map((m) => ({
            key: m.ym,
            label: m.ym,
            sub: `${m.count} gifts`,
            amount: m.totalCents,
          }))}
        />
        <PanelTable
          title="By donor"
          rows={summary.perDonor.map((d) => ({
            key: d.donorKey,
            label: d.donorLabel,
            sub: `${d.count} gifts`,
            amount: d.totalCents,
          }))}
        />
        <PanelTable
          title="By student"
          rows={summary.perStudent.map((s) => ({
            key: s.studentSlug,
            label: s.studentSlug,
            sub: `${s.count} gifts`,
            amount: s.totalCents,
          }))}
        />
      </div>

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        Counts manual ledger entries only. Stripe-attributed donations live in a separate stream;
        admins reconcile both in the admin dashboard.
      </p>
    </section>
  );
}

function PanelTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ key: string; label: string; sub: string; amount: number }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{title}</p>
      {rows.length === 0 ? (
        <p className="text-body-sm text-ink-2">No data.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2 last:border-b-0"
            >
              <span className="flex flex-col text-body-sm">
                <span className="text-ink">{r.label}</span>
                <span className="text-meta uppercase tracking-[0.06em] text-ink-2">{r.sub}</span>
              </span>
              <span className="tabular-nums text-ink">{currency.format(r.amount / 100)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
