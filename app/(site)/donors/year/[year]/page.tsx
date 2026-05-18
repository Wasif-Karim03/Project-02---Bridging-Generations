import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import {
  getDonorsByYear,
  getYearTotalDonated,
} from "@/lib/content/donorProfiles";
import { DonorYearGrid } from "./_components/DonorYearGrid";

type Params = { year: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} Donors — Bridging Generations`,
    description: `See all donors who gave to Bridging Generations in ${year}.`,
  };
}

export default async function DonorsByYearPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { year } = await params;
  const yearNum = Number.parseInt(year, 10);

  const donors = await getDonorsByYear(yearNum);

  const items = donors.map((donor) => ({
    id: donor.id,
    displayName: donor.displayName,
    photoUrl: donor.photoUrl ?? null,
    country: (donor as { country?: string | null }).country ?? null,
    totalDonated: getYearTotalDonated(donor.donationHistory ?? [], yearNum),
  }));

  return (
    <main className="bg-ground">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24">
        <nav aria-label="Breadcrumb" className="mb-10">
          <Link
            href="/donors"
            className="text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-accent-2-text focus-visible:text-accent-2-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
          >
            ← Back to donors
          </Link>
        </nav>

        <h1 className="mb-10 text-display-2 text-ink">
          {year} Donors{" "}
          <span className="text-heading-4 font-normal text-ink-2">
            ({items.length})
          </span>
        </h1>

        <DonorYearGrid items={items} />
      </div>
    </main>
  );
}
