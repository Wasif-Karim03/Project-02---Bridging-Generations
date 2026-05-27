import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { getMediaFolderById, listMediaItemsForFolder } from "@/lib/db/queries/mediaFolders";
import { AddItemForm } from "./_components/AddItemForm";
import { DeleteItemButton } from "./_components/DeleteItemButton";

export const metadata: Metadata = {
  title: "Media folder",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

type Params = { id: string };

export default async function FolderDetailPage({ params }: { params: Promise<Params> }) {
  const { role } = await requireRole("media");
  const { id } = await params;
  const folder = await getMediaFolderById(id);
  if (!folder) notFound();
  const me = await getCurrentDbUser();
  const canEdit = !!me && (folder.ownerUserId === me.id || role === "admin" || role === "it");
  const items = await listMediaItemsForFolder(id);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Media · Folder</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">{folder.name}</h1>
        {folder.eventName ? <p className="text-body-lg text-ink-2">{folder.eventName}</p> : null}
        {folder.description ? (
          <p className="max-w-[60ch] text-body text-ink-2">{folder.description}</p>
        ) : null}
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          {folder.eventDate ? `Event date · ${folder.eventDate} · ` : ""}
          {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
          {dateFormatter.format(folder.createdAt)} created
        </p>
      </header>

      {canEdit ? <AddItemForm folderId={folder.id} /> : null}

      <section aria-labelledby="items-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="items-title" className="text-heading-3 text-ink">
            Items
          </h2>
        </header>
        {items.length === 0 ? (
          <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
            No items yet. Add the first one with the form above.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 border border-hairline bg-ground-2 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">
                    {item.kind}
                  </span>
                  {canEdit ? <DeleteItemButton folderId={folder.id} itemId={item.id} /> : null}
                </div>
                {item.title ? <p className="text-heading-5 text-ink">{item.title}</p> : null}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-body-sm text-accent underline underline-offset-[3px] hover:no-underline"
                >
                  {item.url}
                </a>
                {item.caption ? <p className="text-body-sm text-ink-2">{item.caption}</p> : null}
                <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                  Added {dateFormatter.format(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        <Link
          href="/dashboard/media"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          ← Back to folders
        </Link>
      </p>
    </div>
  );
}
