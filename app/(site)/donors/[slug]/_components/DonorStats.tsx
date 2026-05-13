type DonorStatsProps = {
  totalDonated: number;
  yearsActive: number;
  studentsSupported: number;
};

export function DonorStats({ totalDonated, yearsActive, studentsSupported }: DonorStatsProps) {
  const stats = [
    { label: "Total donated", value: `$${totalDonated.toLocaleString("en-US")}` },
    { label: "Years active", value: String(yearsActive) },
    { label: "Students supported", value: String(studentsSupported) },
  ];

  return (
    <div className="grid grid-cols-1 gap-px border border-hairline sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 bg-ground-2 px-6 py-5">
          <p className="text-display-2 font-bold tabular-nums text-ink">{stat.value}</p>
          <p className="text-meta uppercase tracking-[0.1em] text-ink-2">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
