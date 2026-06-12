import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { getAllStudents, getApprovedPublicStudents } from "@/lib/content/students";
import { getFeaturedDonorById } from "@/lib/db/queries/featuredDonors";
import { formatDollars, formatUsd, formatYearMonth } from "@/lib/donor/featured";
import { PageHeader } from "../../_components/SectionScaffold";
import { PhotoUploader } from "../_components/PhotoUploader";
import { StudentPicker } from "../_components/StudentPicker";
import {
  addContributionAction,
  deleteContributionAction,
  deleteDonorAction,
  removeDonorPhotoAction,
  saveDonorAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Edit donor · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const inputCls =
  "min-h-[44px] w-full rounded-lg border border-hairline bg-ground px-3 text-body text-ink";
const labelCls = "flex flex-col gap-1";
const labelText = "text-meta uppercase tracking-[0.06em] text-ink-2";

export default async function EditDonorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const donor = await getFeaturedDonorById(id);
  if (!donor) notFound();

  // Student directory for the gift picker — Keystatic students plus approved
  // registrations, deduped by id. Admins pick a student; the datalist also
  // allows typing a name that isn't in the system yet.
  const [ksStudents, dbStudents] = await Promise.all([
    getAllStudents(),
    getApprovedPublicStudents(),
  ]);
  const directory = [
    ...new Map([...ksStudents, ...dbStudents].map((s) => [s.id, s.displayName])),
  ].map(([sid, displayName]) => ({ id: sid, displayName }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/admin/donor-wall"
          className="text-meta uppercase tracking-[0.06em] text-ink-2 hover:text-accent"
        >
          ← All donors
        </Link>
        <Link
          href={`/donors/featured/${donor.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-meta uppercase tracking-[0.06em] text-accent hover:underline"
        >
          View public page ↗
        </Link>
      </div>

      <PageHeader
        eyebrow="Edit donor"
        title={donor.name}
        description={`${formatUsd(donor.totalCents)} given · supporting ${donor.studentCount} student${donor.studentCount === 1 ? "" : "s"}.`}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* ---- Donor details ---- */}
        <form
          action={saveDonorAction}
          className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5"
        >
          <input type="hidden" name="id" value={donor.id} />
          <h2 className="text-heading-5 text-ink">Details</h2>

          <div className="flex flex-col gap-2">
            <span className={labelText}>Photo</span>
            <PhotoUploader donorId={donor.id} name={donor.name} photoUrl={donor.photoUrl} />
            {donor.photoUrl ? (
              <button
                type="submit"
                formAction={removeDonorPhotoAction}
                className="self-start text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
              >
                Remove photo
              </button>
            ) : null}
          </div>

          <label className={labelCls}>
            <span className={labelText}>Name</span>
            <input name="name" defaultValue={donor.name} required className={inputCls} />
          </label>

          <label className={labelCls}>
            <span className={labelText}>Short note (optional)</span>
            <input
              name="blurb"
              defaultValue={donor.blurb ?? ""}
              maxLength={280}
              placeholder="e.g. Supporting students since 2022"
              className={inputCls}
            />
          </label>

          <div className="flex flex-wrap items-end gap-4">
            <label className={`${labelCls} w-28`}>
              <span className={labelText}>Sort order</span>
              <input
                name="displayOrder"
                type="number"
                defaultValue={donor.displayOrder}
                className={inputCls}
              />
            </label>
            <label className="flex min-h-[44px] items-center gap-2">
              <input
                name="published"
                type="checkbox"
                defaultChecked={donor.published}
                className="size-4"
              />
              <span className="text-body-sm text-ink">Published (visible on /donors)</span>
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
          >
            Save details
          </button>
        </form>

        {/* ---- Contributions ---- */}
        <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5">
          <h2 className="text-heading-5 text-ink">Gifts ({donor.contributions.length})</h2>

          {donor.contributions.length === 0 ? (
            <p className="text-body-sm text-ink-2">
              No gifts logged yet. Add the first one below — the donor's total and student count
              update automatically.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-hairline">
              <table className="w-full border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                    <th className="px-3 py-2 text-left">Student</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Year</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {donor.contributions.map((c) => (
                    <tr key={c.id} className="border-b border-hairline last:border-b-0">
                      <td className="px-3 py-2 text-ink">
                        {c.studentName}
                        {c.studentRef ? (
                          <span className="text-ink-2"> (ID: {c.studentRef})</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink">
                        {formatDollars(c.amountCents)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink-2">
                        {formatYearMonth(c.year, c.month)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form action={deleteContributionAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="donorId" value={donor.id} />
                          <button
                            type="submit"
                            className="text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add a gift */}
          <form
            action={addContributionAction}
            className="flex flex-col gap-3 rounded-lg border border-dashed border-hairline p-4"
          >
            <input type="hidden" name="donorId" value={donor.id} />
            <p className="text-meta uppercase tracking-[0.06em] text-ink-2">Add a gift</p>

            <StudentPicker students={directory} />

            <div className="grid grid-cols-2 gap-3">
              <label className={labelCls}>
                <span className={labelText}>Amount (USD)</span>
                <input
                  name="amount"
                  required
                  inputMode="decimal"
                  placeholder="60"
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>When</span>
                <input name="when" type="month" className={inputCls} />
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ink px-5 text-nav-link uppercase text-white transition-colors hover:bg-ink/90"
            >
              Add gift
            </button>
          </form>
        </div>
      </div>

      {/* Danger zone */}
      <form action={deleteDonorAction} className="border-t border-hairline pt-6">
        <input type="hidden" name="id" value={donor.id} />
        <button
          type="submit"
          className="text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
        >
          Delete this donor and all their gifts
        </button>
      </form>
    </div>
  );
}
