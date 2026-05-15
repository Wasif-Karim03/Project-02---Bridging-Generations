import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { isDbConfigured } from "@/db/client";
import { getAllStudents } from "@/lib/content/students";
import { getDonationsForUser, getStudentsSponsoredByUser } from "@/lib/db/queries/donations";
import { getDonorProfile } from "@/lib/db/queries/donorProfiles";
import { getUserById } from "@/lib/db/queries/users";
import { donorCodeForUuid } from "@/lib/donor/donorCode";
import { AdminDonorEditor } from "./_components/AdminDonorEditor";

export const metadata: Metadata = {
  title: "Donor detail (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function AdminDonorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Role check is enforced by the parent admin layout.
  const { id } = await params;
  const dbReady = isDbConfigured();

  if (!dbReady) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/dashboard/admin"
          className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
        >
          ← Admin overview
        </Link>
        <h1 className="text-heading-2 text-ink">Donor detail</h1>
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-body text-ink-2">
          The donor detail page reads from Postgres. Provision Neon and set DATABASE_URL to load
          real donors.
        </p>
      </div>
    );
  }

  const [user, profile, donations, sponsored, allStudents] = await Promise.all([
    getUserById(id),
    getDonorProfile(id),
    getDonationsForUser(id),
    getStudentsSponsoredByUser(id),
    getAllStudents(),
  ]);
  if (!user) notFound();
  const studentBySlug = new Map(allStudents.map((s) => [s.id, s]));
  const donorCode = donorCodeForUuid(user.id);
  const lifetimeCents = donations.reduce((sum, d) => sum + d.amountCents, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/admin"
          className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
        >
          ← Admin overview
        </Link>
        <h1 className="text-balance text-heading-1 text-ink">{profile.legalName || user.email}</h1>
        <p className="font-mono text-meta uppercase tracking-[0.08em] text-ink-2">
          {donorCode} · {user.role}
        </p>
      </div>

      <section
        aria-labelledby="info-title"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Stat label="Email" value={user.email} />
        <Stat label="Joined" value={dateFormatter.format(user.createdAt)} />
        <Stat label="Lifetime" value={currency.format(lifetimeCents / 100)} />
        <Stat label="Gifts" value={String(donations.length)} />
      </section>

      <section aria-labelledby="profile-title" className="flex flex-col gap-4">
        <header className="border-b border-hairline pb-3">
          <h2 id="profile-title" className="text-heading-3 text-ink">
            Public profile
          </h2>
          <p className="mt-1 text-body-sm text-ink-2">
            What appears on /donors. The donor can edit these themselves on
            /dashboard/donor/profile; you can also edit on their behalf here.
          </p>
        </header>
        <AdminDonorEditor
          donorUserId={user.id}
          currentRole={user.role}
          initial={{
            legalName: profile.legalName,
            publicInitials: profile.publicInitials,
            anonymous: profile.anonymous,
            dedicationText: profile.dedicationText,
          }}
        />
      </section>

      <section aria-labelledby="sponsored-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="sponsored-title" className="text-heading-3 text-ink">
            Students supported
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {sponsored.length} {sponsored.length === 1 ? "student" : "students"}
          </span>
        </header>
        {sponsored.length === 0 ? (
          <p className="text-body text-ink-2">No per-student sponsorships yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sponsored.map((s) => (
              <li key={s.studentSlug} className="border border-hairline bg-ground-2 p-4">
                <p className="text-heading-5 text-ink">
                  {studentBySlug.get(s.studentSlug)?.displayName ?? s.studentSlug}
                </p>
                <p className="mt-1 text-display-3 tabular-nums text-ink">
                  {currency.format(s.totalCents / 100)}
                </p>
                <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                  {s.giftCount} {s.giftCount === 1 ? "gift" : "gifts"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="donations-title" className="flex flex-col gap-4">
        <header className="border-b border-hairline pb-3">
          <h2 id="donations-title" className="text-heading-3 text-ink">
            Donations
          </h2>
        </header>
        {donations.length === 0 ? (
          <p className="text-body text-ink-2">No donations recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Date</th>
                  <th className="py-3 pr-4 text-left">Target</th>
                  <th className="py-3 pr-4 text-right">Amount</th>
                  <th className="py-3 pr-4 text-left">Type</th>
                  <th className="py-3 text-left">Reference</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-ink">
                      <time dateTime={d.occurredAt.toISOString()}>
                        {dateFormatter.format(d.occurredAt)}
                      </time>
                    </td>
                    <td className="py-3 pr-4 align-top text-ink">
                      {d.studentSlug
                        ? (studentBySlug.get(d.studentSlug)?.displayName ?? d.studentSlug)
                        : d.projectSlug
                          ? d.projectSlug
                          : "General fund"}
                    </td>
                    <td className="py-3 pr-4 text-right align-top tabular-nums text-ink">
                      {currency.format(d.amountCents / 100)}
                    </td>
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      {d.recurring ? "Recurring" : "One-time"}
                    </td>
                    <td className="py-3 align-top font-mono text-meta text-ink-2">
                      {d.externalReference?.slice(0, 24) ?? "—"}
                    </td>
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
    <div className="border border-hairline bg-ground-2 p-4">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label}</p>
      <p className="mt-2 break-words text-body text-ink">{value}</p>
    </div>
  );
}
