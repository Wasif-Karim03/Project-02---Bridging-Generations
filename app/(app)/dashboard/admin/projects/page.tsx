import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { listProjects } from "@/lib/db/queries/projects";
import { formatMoney, fundingPercent } from "@/lib/projects/format";
import { PageHeader } from "../_components/SectionScaffold";
import { createProjectAction } from "./actions";

export const metadata: Metadata = {
  title: "Projects · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Manage"
        title="Projects"
        description="Fundraising projects shown on the public site. Add a project, upload a cover and gallery photos, set the goal, and add links — progress is calculated automatically."
      />

      <form
        action={createProjectAction}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-ground-2 p-5"
      >
        <label className="flex min-w-[240px] flex-1 flex-col gap-1">
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">New project name</span>
          <input
            name="name"
            required
            placeholder="e.g. Shobhana Mahathera School"
            className="min-h-[44px] rounded-lg border border-hairline bg-ground px-3 text-body text-ink"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
        >
          Add project →
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-ground-2 px-5 py-8 text-center text-body text-ink-2">
          No projects yet. Add one above to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p) => {
            const pct = fundingPercent(p.raisedCents, p.targetCents);
            return (
              <li key={p.id}>
                <Link
                  href={`/dashboard/admin/projects/${p.id}`}
                  className="flex items-center gap-4 rounded-xl border border-hairline bg-ground-2 p-4 transition-colors hover:border-accent"
                >
                  {p.coverUrl ? (
                    // biome-ignore lint/performance/noImgElement: R2-hosted cover URL
                    <img
                      src={p.coverUrl}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-accent/10 text-meta uppercase text-accent">
                      No cover
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p.name}</p>
                    {p.tagline ? (
                      <p className="truncate text-body-sm text-ink-2">{p.tagline}</p>
                    ) : null}
                    <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">
                      {formatMoney(p.raisedCents)} / {formatMoney(p.targetCents)} · {pct}% ·{" "}
                      {p.published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <span className="shrink-0 text-meta uppercase tracking-[0.06em] text-accent">
                    Edit →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
