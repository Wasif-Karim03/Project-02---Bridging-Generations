import { getTranslations } from "next-intl/server";

type DonorStatsProps = {
  totalDonated: number;
  yearsActive: number;
  studentsSupported: number;
};

export async function DonorStats({
  totalDonated,
  yearsActive,
  studentsSupported,
}: DonorStatsProps) {
  const tx = await getTranslations("donorsPageExtra");
  const stats = [
    { label: tx("statTotalDonated"), value: `$${totalDonated.toLocaleString("en-US")}` },
    { label: tx("statYearsActive"), value: String(yearsActive) },
    { label: tx("statStudentsSupported"), value: String(studentsSupported) },
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
