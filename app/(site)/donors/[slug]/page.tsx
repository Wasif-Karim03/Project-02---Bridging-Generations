import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import {
  type DonationEntry,
  getAllPublicDonorProfiles,
  getDonorProfileBySlug,
  getStudentsSupported,
  getTotalDonated,
  getYearsActive,
  groupHistoryByYearMonth,
} from "@/lib/content/donorProfiles";
import { getStudentBySlug } from "@/lib/content/students";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { DonorCalendarView } from "./_components/DonorCalendarView";
import { DonorProfileCard } from "./_components/DonorProfileCard";
import { DonorStats } from "./_components/DonorStats";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const profiles = await getAllPublicDonorProfiles();
  return profiles.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getDonorProfileBySlug(slug);
  if (!profile || profile.isAnonymous) return { title: "Donor" };
  return {
    title: `${profile.displayName} — Donor profile`,
    description: `${profile.displayName} has supported Bridging Generations students since ${profile.joinedDate ? new Date(profile.joinedDate).getFullYear() : "the beginning"}.`,
    robots: { index: false, follow: true },
  };
}

const DESIGNATION_LABELS: Record<string, string> = {
  tuition: "Tuition",
  books: "Books & learning materials",
  meals: "Daily meals",
  materials: "School supplies",
  general: "General",
};

export default async function DonorProfilePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const profile = await getDonorProfileBySlug(slug);

  if (!profile || profile.isAnonymous) {
    notFound();
  }

  const history = profile.donationHistory ?? [];
  const totalDonated = getTotalDonated(history);
  const yearsActive = getYearsActive(history);
  const studentsSupported = getStudentsSupported(history);
  const byYearMonth = groupHistoryByYearMonth(history);

  // Resolve student names for donation entries that have a linked student
  const studentIds = [
    ...new Set(history.map((e) => e.linkedStudentId).filter((id): id is string => Boolean(id))),
  ];
  const studentMap = new Map<string, string>();
  await Promise.all(
    studentIds.map(async (id) => {
      const student = await getStudentBySlug(id);
      if (student && canShowPortrait(student.consent)) {
        studentMap.set(id, student.displayName);
      }
    }),
  );

  const sortedHistory = [...history]
    .filter((e): e is DonationEntry & { date: string } => Boolean(e.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Donors", url: "/donors" },
    { name: profile.displayName, url: `/donors/${profile.id}` },
  ]);

  return (
    <>
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

          <article className="flex flex-col gap-16 lg:gap-20">
            {/* Profile card */}
            <DonorProfileCard profile={profile} />

            {/* Lifetime stats */}
            <section aria-labelledby="donor-stats-title">
              <Eyebrow className="mb-4">Giving history</Eyebrow>
              <h2 id="donor-stats-title" className="sr-only">
                Lifetime statistics
              </h2>
              <DonorStats
                totalDonated={totalDonated}
                yearsActive={yearsActive}
                studentsSupported={studentsSupported}
              />
            </section>

            {/* Calendar heat map */}
            {byYearMonth.size > 0 ? (
              <section aria-labelledby="donor-calendar-title">
                <h2 id="donor-calendar-title" className="mb-4 text-heading-4 text-ink">
                  Donation calendar
                </h2>
                <DonorCalendarView byYearMonth={byYearMonth} />
              </section>
            ) : null}

            {/* Donation history list */}
            {sortedHistory.length > 0 ? (
              <section aria-labelledby="donor-history-title">
                <h2 id="donor-history-title" className="mb-6 text-heading-4 text-ink">
                  All donations
                </h2>
                <ol className="flex flex-col gap-px border border-hairline">
                  {sortedHistory.map((entry, i) => {
                    const d = new Date(entry.date);
                    const dateLabel = d.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                    const studentName = entry.linkedStudentId
                      ? studentMap.get(entry.linkedStudentId)
                      : null;
                    const designationLabel =
                      DESIGNATION_LABELS[entry.designation ?? "general"] ?? "General";

                    return (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list
                        key={i}
                        className="flex flex-col gap-1 bg-ground-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className="text-body-sm font-medium text-ink">{dateLabel}</p>
                          <p className="text-meta text-ink-2">
                            {designationLabel}
                            {studentName ? ` — for ${studentName}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-body-sm tabular-nums font-medium text-ink">
                          ${(entry.amount ?? 0).toLocaleString("en-US")}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ) : null}
          </article>
        </div>
      </main>
      <CTAFooterPanel
        headline="Support a student."
        body="Your gift funds tuition, daily meals, books, and materials for children across the Chittagong Hill Tracts."
        ctaLabel="Create your donor profile"
        ctaHref="/give"
        tone="teal"
        titleId="donor-profile-cta-title"
      />
      <JsonLd id="ld-donor-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
