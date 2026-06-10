import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { listBlogPosts } from "@/lib/db/queries/blogPosts";
import { PageHeader } from "../_components/SectionScaffold";
import { createPostAction } from "./actions";

export const metadata: Metadata = {
  title: "Posts · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await listBlogPosts();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Manage"
        title="Blog"
        description="Write blog posts shown on the public site — a cover photo, a title, the story (English or বাংলা), and optional links. Published posts appear on /blog automatically."
      />

      <form
        action={createPostAction}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-ground-2 p-5"
      >
        <label className="flex min-w-[240px] flex-1 flex-col gap-1">
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">New post title</span>
          <input
            name="title"
            required
            placeholder="Give your story a headline…"
            className="min-h-[44px] rounded-lg border border-hairline bg-ground px-3 text-body text-ink"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
        >
          Start writing →
        </button>
      </form>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-ground-2 px-5 py-8 text-center text-body text-ink-2">
          No posts yet. Add one above to write your first story.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/admin/posts/${p.id}`}
                className="flex items-center gap-4 rounded-xl border border-hairline bg-ground-2 p-4 transition-colors hover:border-accent"
              >
                {p.coverUrl ? (
                  // biome-ignore lint/performance/noImgElement: CDN-hosted cover URL
                  <img src={p.coverUrl} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-14 w-20 shrink-0 place-items-center rounded-lg bg-accent/10 text-meta uppercase text-accent">
                    No cover
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{p.title}</p>
                  <p className="mt-1 text-meta uppercase tracking-[0.06em] text-ink-2">
                    {p.published ? "Published" : "Draft"}
                  </p>
                </div>
                <span className="shrink-0 text-meta uppercase tracking-[0.06em] text-accent">
                  Edit →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
