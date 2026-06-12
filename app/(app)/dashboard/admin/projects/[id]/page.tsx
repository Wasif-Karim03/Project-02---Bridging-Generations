import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { getProjectById } from "@/lib/db/queries/projects";
import { formatMoney, fundingPercent, remainingCents } from "@/lib/projects/format";
import { PageHeader } from "../../_components/SectionScaffold";
import { ImageUploader } from "../_components/ImageUploader";
import {
  addLinkAction,
  deleteImageAction,
  deleteLinkAction,
  deleteProjectAction,
  removeCoverAction,
  saveProjectAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Edit project · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const inputCls =
  "min-h-[44px] w-full rounded-lg border border-hairline bg-ground px-3 text-body text-ink";
const labelCls = "flex flex-col gap-1";
const labelText = "text-meta uppercase tracking-[0.06em] text-ink-2";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const pct = fundingPercent(project.raisedCents, project.targetCents);
  const dollars = (cents: number) => (cents > 0 ? String(Math.round(cents) / 100) : "");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/admin/projects"
          className="text-meta uppercase tracking-[0.06em] text-ink-2 hover:text-accent"
        >
          ← All projects
        </Link>
        <Link
          href={`/projects/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-meta uppercase tracking-[0.06em] text-accent hover:underline"
        >
          View public page ↗
        </Link>
      </div>

      <PageHeader
        eyebrow="Edit project"
        title={project.name}
        description={`${formatMoney(project.raisedCents)} of ${formatMoney(project.targetCents)} raised · ${pct}% · ${formatMoney(remainingCents(project.raisedCents, project.targetCents))} to go.`}
      />

      {/* Cover */}
      <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-ground-2 p-5">
        <h2 className="text-heading-5 text-ink">Cover photo</h2>
        <div className="flex flex-wrap items-center gap-5">
          {project.coverUrl ? (
            // biome-ignore lint/performance/noImgElement: R2-hosted cover URL
            <img src={project.coverUrl} alt="" className="h-32 w-48 rounded-lg object-cover" />
          ) : (
            <span className="grid h-32 w-48 place-items-center rounded-lg bg-accent/10 text-meta uppercase text-accent">
              No cover yet
            </span>
          )}
          <div className="flex flex-col gap-2">
            <ImageUploader
              projectId={project.id}
              kind="cover"
              label={project.coverUrl ? "Change cover" : "Upload cover"}
            />
            {project.coverUrl ? (
              <form action={removeCoverAction}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="coverUrl" value={project.coverUrl} />
                <button
                  type="submit"
                  className="text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
                >
                  Remove cover
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      {/* Details */}
      <form
        action={saveProjectAction}
        className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5"
      >
        <input type="hidden" name="id" value={project.id} />
        <h2 className="text-heading-5 text-ink">Details</h2>

        <label className={labelCls}>
          <span className={labelText}>Project name</span>
          <input name="name" defaultValue={project.name} required className={inputCls} />
        </label>

        <label className={labelCls}>
          <span className={labelText}>Tagline</span>
          <input
            name="tagline"
            defaultValue={project.tagline ?? ""}
            maxLength={280}
            placeholder="One line shown under the name"
            className={inputCls}
          />
        </label>

        <label className={labelCls}>
          <span className={labelText}>Description</span>
          <textarea
            name="description"
            defaultValue={project.description ?? ""}
            rows={6}
            placeholder="What the project is and what it funds…"
            className={`${inputCls} min-h-[140px] py-2`}
          />
        </label>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className={labelCls}>
            <span className={labelText}>Raised (USD)</span>
            <input
              name="raised"
              inputMode="decimal"
              defaultValue={dollars(project.raisedCents)}
              placeholder="0"
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            <span className={labelText}>Target (USD)</span>
            <input
              name="target"
              inputMode="decimal"
              defaultValue={dollars(project.targetCents)}
              placeholder="0"
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            <span className={labelText}>Sort order</span>
            <input
              name="displayOrder"
              type="number"
              defaultValue={project.displayOrder}
              className={inputCls}
            />
          </label>
          <label className="flex min-h-[44px] items-end gap-2 pb-2">
            <input
              name="published"
              type="checkbox"
              defaultChecked={project.published}
              className="size-4"
            />
            <span className="text-body-sm text-ink">Published</span>
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center self-start rounded-lg bg-accent px-6 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
        >
          Save details
        </button>
      </form>

      {/* Gallery */}
      <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-heading-5 text-ink">Gallery ({project.images.length})</h2>
          <ImageUploader projectId={project.id} kind="gallery" label="Add photos" />
        </div>
        {project.images.length === 0 ? (
          <p className="text-body-sm text-ink-2">No gallery photos yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {project.images.map((img) => (
              <li
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-hairline"
              >
                {/* biome-ignore lint/performance/noImgElement: R2-hosted gallery URL */}
                <img
                  src={img.url}
                  alt={img.caption ?? ""}
                  className="aspect-square w-full object-cover"
                />
                <form action={deleteImageAction} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="projectId" value={project.id} />
                  <button
                    type="submit"
                    aria-label="Remove photo"
                    className="rounded-md bg-ink/80 px-2 py-1 text-meta uppercase text-white hover:bg-red-700"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Links */}
      <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5">
        <h2 className="text-heading-5 text-ink">Links ({project.links.length})</h2>
        {project.links.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {project.links.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="font-medium text-ink">{l.label}</span>{" "}
                  <span className="truncate text-body-sm text-ink-2">{l.url}</span>
                </span>
                <form action={deleteLinkAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="projectId" value={project.id} />
                  <button
                    type="submit"
                    className="shrink-0 text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
        <form
          action={addLinkAction}
          className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-hairline p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end"
        >
          <input type="hidden" name="projectId" value={project.id} />
          <label className={labelCls}>
            <span className={labelText}>Link label</span>
            <input name="label" required placeholder="e.g. News article" className={inputCls} />
          </label>
          <label className={labelCls}>
            <span className={labelText}>URL</span>
            <input name="url" required type="url" placeholder="https://…" className={inputCls} />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ink px-5 text-nav-link uppercase text-white transition-colors hover:bg-ink/90"
          >
            Add link
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <form action={deleteProjectAction} className="border-t border-hairline pt-6">
        <input type="hidden" name="id" value={project.id} />
        <button
          type="submit"
          className="text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
        >
          Delete this project and all its photos and links
        </button>
      </form>
    </div>
  );
}
