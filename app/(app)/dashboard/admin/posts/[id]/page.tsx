import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { getBlogPostById } from "@/lib/db/queries/blogPosts";
import { PageHeader } from "../../_components/SectionScaffold";
import { BlogCoverUploader } from "../_components/BlogCoverUploader";
import {
  addPostLinkAction,
  deletePostAction,
  deletePostLinkAction,
  removePostCoverAction,
  savePostAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Edit post · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const inputCls =
  "min-h-[44px] w-full rounded-lg border border-hairline bg-ground px-3 text-body text-ink";
const labelCls = "flex flex-col gap-1";
const labelText = "text-meta uppercase tracking-[0.06em] text-ink-2";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/admin/posts"
          className="text-meta uppercase tracking-[0.06em] text-ink-2 hover:text-accent"
        >
          ← All posts
        </Link>
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-meta uppercase tracking-[0.06em] text-accent hover:underline"
        >
          View public page ↗
        </Link>
      </div>

      <PageHeader eyebrow="Edit post" title={post.title} />

      {/* Cover */}
      <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-ground-2 p-5">
        <h2 className="text-heading-5 text-ink">Cover photo</h2>
        <BlogCoverUploader postId={post.id} coverUrl={post.coverUrl} />
        {post.coverUrl ? (
          <form action={removePostCoverAction}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="self-start text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
            >
              Remove cover
            </button>
          </form>
        ) : null}
      </section>

      {/* Details */}
      <form
        action={savePostAction}
        className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5"
      >
        <input type="hidden" name="id" value={post.id} />
        <h2 className="text-heading-5 text-ink">Story</h2>

        <label className={labelCls}>
          <span className={labelText}>Title</span>
          <input name="title" defaultValue={post.title} required className={inputCls} />
        </label>

        <label className={labelCls}>
          <span className={labelText}>Story (English or বাংলা)</span>
          <textarea
            name="body"
            defaultValue={post.body ?? ""}
            rows={12}
            placeholder="Write the story here… line breaks are preserved."
            className={`${inputCls} min-h-[260px] py-2 leading-relaxed`}
          />
        </label>

        <div className="flex flex-wrap items-end gap-4">
          <label className={`${labelCls} w-28`}>
            <span className={labelText}>Sort order</span>
            <input
              name="displayOrder"
              type="number"
              defaultValue={post.displayOrder}
              className={inputCls}
            />
          </label>
          <label className="flex min-h-[44px] items-center gap-2">
            <input
              name="published"
              type="checkbox"
              defaultChecked={post.published}
              className="size-4"
            />
            <span className="text-body-sm text-ink">Published (visible on /blog)</span>
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center self-start rounded-lg bg-accent px-6 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
        >
          Save post
        </button>
      </form>

      {/* Links */}
      <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-ground-2 p-5">
        <h2 className="text-heading-5 text-ink">Links ({post.links.length})</h2>
        {post.links.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {post.links.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="font-medium text-ink">{l.label}</span>{" "}
                  <span className="truncate text-body-sm text-ink-2">{l.url}</span>
                </span>
                <form action={deletePostLinkAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="postId" value={post.id} />
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
          action={addPostLinkAction}
          className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-hairline p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end"
        >
          <input type="hidden" name="postId" value={post.id} />
          <label className={labelCls}>
            <span className={labelText}>Link label</span>
            <input name="label" required placeholder="e.g. Full report" className={inputCls} />
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
      <form action={deletePostAction} className="border-t border-hairline pt-6">
        <input type="hidden" name="id" value={post.id} />
        <button
          type="submit"
          className="text-meta uppercase tracking-[0.06em] text-red-700 hover:underline"
        >
          Delete this post
        </button>
      </form>
    </div>
  );
}
