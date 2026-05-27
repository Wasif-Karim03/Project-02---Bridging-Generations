import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { listMediaFoldersForUser } from "@/lib/db/queries/mediaFolders";

export const metadata: Metadata = {
  title: "Media dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Media dashboard. requireRole gates by status (active) + role (media).
// Lists folders owned by the current user — one per event or project.
// Admins see folders across all users on /dashboard/admin (PR 5).
export default async function MediaDashboard() {
  await requireRole("media");
  const dbUser = await getCurrentDbUser();
  const folders = dbUser ? await listMediaFoldersForUser(dbUser.id) : [];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <Eyebrow>Media workspace</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Event + project folders.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Create one folder per event or project. Inside each folder, add images, external links,
          and any media you want to preserve. Admins can see all folders from their dashboard.
        </p>
      </header>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/media/folders/new"
          className="inline-flex min-h-[48px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
        >
          New folder →
        </Link>
      </section>

      <section aria-labelledby="folders-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h2 id="folders-title" className="text-heading-3 text-ink">
            Your folders
          </h2>
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
            {folders.length} {folders.length === 1 ? "folder" : "folders"}
          </span>
        </header>
        {folders.length === 0 ? (
          <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
            No folders yet. Create your first one with the button above.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/dashboard/media/folders/${f.id}`}
                  className="group flex h-full flex-col gap-2 border border-hairline bg-ground-2 p-6 transition-colors hover:border-accent"
                >
                  <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">
                    {f.eventDate ? f.eventDate : "Event"}
                  </span>
                  <span className="text-heading-5 text-ink group-hover:text-accent">{f.name}</span>
                  {f.eventName ? (
                    <span className="text-body-sm text-ink-2">{f.eventName}</span>
                  ) : null}
                  <span className="mt-auto text-meta uppercase tracking-[0.06em] text-ink-2">
                    Created {dateFormatter.format(f.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
