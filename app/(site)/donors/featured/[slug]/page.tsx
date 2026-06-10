import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { DonorAvatar } from "@/components/domain/DonorAvatar";
import { getFeaturedDonorBySlug } from "@/lib/db/queries/featuredDonors";
import { formatDollars, formatUsd, formatYearMonth } from "@/lib/donor/featured";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const donor = await getFeaturedDonorBySlug(slug);
  if (!donor || !donor.published) return { title: "Donor" };
  return {
    title: `${donor.name} — Donor`,
    description: `${donor.name} has given ${formatUsd(donor.totalCents)} to Bridging Generations students.`,
    robots: { index: false, follow: true },
  };
}

export default async function FeaturedDonorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const donor = await getFeaturedDonorBySlug(slug);
  if (!donor || !donor.published) notFound();

  return (
    <>
      <main className="bg-ground">
        <div className="mx-auto max-w-[880px] px-4 py-16 sm:px-6 lg:py-24">
          <nav aria-label="Breadcrumb" className="mb-10">
            <Link
              href="/donors"
              className="text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-accent-2-text"
            >
              ← Back to donors
            </Link>
          </nav>

          {/* Header — photo, name, total */}
          <header className="flex flex-col items-center gap-4 text-center">
            <DonorAvatar
              name={donor.name}
              photoUrl={donor.photoUrl}
              className="size-28 shadow-[var(--shadow-card)]"
              monogramClassName="text-heading-2"
            />
            <h1 className="text-heading-2 uppercase tracking-[0.02em] text-ink">{donor.name}</h1>
            {donor.blurb ? <p className="max-w-[48ch] text-body text-ink-2">{donor.blurb}</p> : null}
            <p className="text-heading-4 text-ink">
              Total: <span className="tabular-nums">{formatUsd(donor.totalCents)}</span>
            </p>
            <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
              Supporting {donor.studentCount} student{donor.studentCount === 1 ? "" : "s"}
            </p>
          </header>

          {/* Breakdown table */}
          {donor.contributions.length > 0 ? (
            <div className="mt-12 overflow-x-auto rounded-xl border border-hairline">
              <table className="w-full border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-hairline bg-ground-2 text-meta uppercase tracking-[0.06em] text-ink-2">
                    <th className="px-5 py-3 text-left font-semibold">Name</th>
                    <th className="px-5 py-3 text-right font-semibold">Amount (USD)</th>
                    <th className="px-5 py-3 text-right font-semibold">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {donor.contributions.map((c) => (
                    <tr key={c.id} className="border-b border-hairline last:border-b-0">
                      <td className="px-5 py-3 text-ink">
                        {c.studentName}
                        {c.studentRef ? (
                          <span className="text-ink-2"> (ID: {c.studentRef})</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-ink">
                        {formatDollars(c.amountCents)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-ink-2">
                        {formatYearMonth(c.year, c.month)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-12 text-center text-body text-ink-2">No gifts recorded yet.</p>
          )}
        </div>
      </main>
      <CTAFooterPanel
        headline="Become a donor"
        body="Join supporters like this and help keep a student in the classroom."
        ctaLabel="Donate"
        ctaHref="/be-a-donor"
        tone="teal"
        titleId="featured-donor-cta-title"
      />
    </>
  );
}
