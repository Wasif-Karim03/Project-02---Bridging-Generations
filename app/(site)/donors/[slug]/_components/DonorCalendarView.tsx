const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TIERS: Array<{ label: string; min: number; opacity: number }> = [
  { label: "No gift", min: 0, opacity: 0 },
  { label: "Small", min: 1, opacity: 0.15 },
  { label: "Medium", min: 50, opacity: 0.4 },
  { label: "Large", min: 150, opacity: 0.65 },
  { label: "Major", min: 500, opacity: 1 },
];

function getTierOpacity(amount: number): number {
  let opacity = 0;
  for (const tier of TIERS) {
    if (amount >= tier.min) opacity = tier.opacity;
  }
  return opacity;
}

type DonorCalendarViewProps = {
  byYearMonth: Map<number, Map<number, number>>;
};

export function DonorCalendarView({ byYearMonth }: DonorCalendarViewProps) {
  const years = [...byYearMonth.keys()].sort((a, b) => a - b);

  if (years.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Header row */}
          <div className="grid grid-cols-[3rem_repeat(12,_1fr)] gap-1 pb-1">
            <div />
            {MONTHS.map((m) => (
              <div
                key={m}
                className="text-center text-[10px] uppercase tracking-[0.08em] text-ink-2"
              >
                {m}
              </div>
            ))}
          </div>

          {/* Year rows */}
          {years.map((year) => {
            const monthMap = byYearMonth.get(year) ?? new Map<number, number>();
            return (
              <div key={year} className="grid grid-cols-[3rem_repeat(12,_1fr)] gap-1 py-0.5">
                <div className="flex items-center text-[11px] uppercase tracking-[0.08em] text-ink-2">
                  {year}
                </div>
                {MONTHS.map((_, idx) => {
                  const month = idx + 1;
                  const amount = monthMap.get(month) ?? 0;
                  const opacity = getTierOpacity(amount);
                  const title =
                    amount > 0
                      ? `${MONTHS[idx]} ${year}: $${amount.toLocaleString("en-US")}`
                      : `${MONTHS[idx]} ${year}: no gift`;

                  return (
                    <div
                      key={month}
                      title={title}
                      className="relative aspect-square w-full bg-ground-3"
                    >
                      {opacity > 0 ? (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-accent"
                          style={{ opacity }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {TIERS.map((tier) => (
          <div key={tier.label} className="flex items-center gap-1.5">
            <div className="relative h-3 w-3 bg-ground-3">
              {tier.opacity > 0 ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-accent"
                  style={{ opacity: tier.opacity }}
                />
              ) : null}
            </div>
            <span className="text-meta text-ink-2">{tier.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
