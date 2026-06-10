import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { listFeaturedDonors } from "@/lib/db/queries/featuredDonors";
import { formatUsd, initialsFromName } from "@/lib/donor/featured";
import { PageHeader } from "../_components/SectionScaffold";
import { createDonorAction } from "./actions";

export const metadata: Metadata = {
  title: "Donor Wall · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DonorWallAdminPage() {
  const donors = await listFeaturedDonors();
  const totalCents = donors.reduce((s, d) => s + d.totalCents, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Manage"
        title="Donor Wall"
        description="Featured donors shown publicly on the Donors page. Add a donor, upload a photo, and log each gift they've made to a student — totals are calculated automatically."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Featured donors" value={String(donors.length)} sub="On the public wall" />
        <StatCard
          label="Published"
          value={String(donors.filter((d) => d.published).length)}
          sub="Visible to visitors"
        />
        <StatCard label="Total featured" value={formatUsd(totalCents)} sub="Across all donors" />
      </section>

      {/* Add a donor — name only; the editor opens next for photo + gifts. */}
      <form
        action={createDonorAction}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-ground-2 p-5"
      >
        <label className="flex min-w-[240px] flex-1 flex-col gap-1">
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">New donor name</span>
          <input
            name="name"
            required
            placeholder="e.g. Ruby Barua"
            className="min-h-[44px] rounded-lg border border-hairline bg-ground px-3 text-body text-ink"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
        >
          Add donor →
        </button>
      </form>

      {donors.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-ground-2 px-5 py-8 text-center text-body text-ink-2">
          No featured donors yet. Add one above to start building the public donor wall.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-ground-2">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                <th className="px-4 py-3 text-left">Donor</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Students</th>
                <th className="px-4 py-3 text-right">Gifts</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d) => (
                <tr key={d.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/admin/donor-wall/${d.id}`}
                      className="flex items-center gap-3"
                    >
                      <DonorThumb name={d.name} photoUrl={d.photoUrl} />
                      <span className="font-medium text-accent underline underline-offset-[3px] hover:no-underline">
                        {d.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {formatUsd(d.totalCents)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-2">{d.studentCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-2">{d.giftCount}</td>
                  <td className="px-4 py-3 text-right text-meta uppercase tracking-[0.06em] text-ink-2">
                    {d.published ? "Published" : "Draft"}
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

function DonorThumb({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: arbitrary external donor photo URL
      <img
        src={photoUrl}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-meta font-semibold text-accent">
      {initialsFromName(name)}
    </span>
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
