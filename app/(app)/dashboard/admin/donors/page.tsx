import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { listAllDonors } from "@/lib/db/queries/donorProfiles";
import { PageHeader } from "../_components/SectionScaffold";
import { formatDonationAmount } from "../_data";

export const metadata: Metadata = {
  title: "Donators · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDonatorsPage() {
  const usingMockData = !isDbConfigured();
  const donorList = await listAllDonors();

  const totalLifetime = donorList.reduce((sum, d) => sum + d.lifetimeCents, 0);
  const totalGifts = donorList.reduce((sum, d) => sum + d.donationCount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Manage"
          title="Donators"
          description="Everyone who has given to Bridging Generations. Open a donor to manage how their name appears publicly."
        />
        <Link
          href="/api/export/donors.xlsx"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
        >
          Export XLSX ↓
        </Link>
      </div>

      {usingMockData ? (
        <p className="rounded-lg border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — real donors appear once DATABASE_URL is set.
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Donors" value={String(donorList.length)} sub="Active accounts" />
        <StatCard
          label="Lifetime given"
          value={formatDonationAmount(totalLifetime)}
          sub="Across all donors"
        />
        <StatCard label="Total gifts" value={String(totalGifts)} sub="Individual donations" />
      </section>

      {donorList.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-ground-2 px-5 py-8 text-center text-body text-ink-2">
          No donor accounts yet. As donors sign up at <code>/sign-up</code>, they appear here
          automatically.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-ground-2">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="px-4 py-3 text-left">Legal name</th>
                <th className="px-4 py-3 text-left">Public</th>
                <th className="px-4 py-3 text-right">Lifetime</th>
                <th className="px-4 py-3 text-right">Gifts</th>
                <th className="px-4 py-3 text-right">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {donorList.map((d) => (
                <tr key={d.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-3 text-ink">
                    <Link
                      href={`/dashboard/admin/donors/${d.id}`}
                      className="font-medium text-accent underline underline-offset-[3px] hover:no-underline"
                    >
                      {d.legalName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{d.publicInitials || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {formatDonationAmount(d.lifetimeCents)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                    {d.donationCount}
                  </td>
                  <td className="px-4 py-3 text-right text-meta uppercase tracking-[0.06em] text-ink-2">
                    {d.anonymous ? "Anon · initials" : "Public · name"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 text-heading-3 tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">{sub}</p>
    </div>
  );
}
