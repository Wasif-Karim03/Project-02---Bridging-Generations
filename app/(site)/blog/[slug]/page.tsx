import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { getBlogPostBySlug } from "@/lib/db/queries/blogPosts";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.published) return { title: "Post" };
  const desc = (post.body ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
  return { title: post.title, description: desc || undefined };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.published) notFound();

  const locale = await getLocale();
  const dateLabel = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(post.createdAt));

  return (
    <>
      <main className="bg-ground">
        {post.coverUrl ? (
          // biome-ignore lint/performance/noImgElement: CDN-hosted cover URL
          <img
            src={post.coverUrl}
            alt={post.title}
            className="h-[40vh] max-h-[480px] w-full object-cover sm:h-[50vh]"
          />
        ) : null}

        <article className="mx-auto max-w-[760px] px-4 py-14 sm:px-6 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/blog"
              className="text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-accent-2-text"
            >
              ← All posts
            </Link>
          </nav>

          <header className="flex flex-col gap-3">
            <p className="text-meta uppercase tracking-[0.06em] text-ink-2">{dateLabel}</p>
            <h1 className="text-balance text-display-2 text-accent">{post.title}</h1>
          </header>

          {post.body ? (
            <div className="mt-10 whitespace-pre-wrap text-body-lg leading-relaxed text-ink">
              {post.body}
            </div>
          ) : null}

          {post.links.length > 0 ? (
            <section className="mt-12 border-t border-hairline pt-8">
              <h2 className="text-eyebrow uppercase text-accent">Links</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {post.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-body font-medium text-accent-2-text underline underline-offset-[3px] hover:no-underline"
                    >
                      {l.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </main>

      <CTAFooterPanel
        headline="Be part of the story"
        body="Your support keeps these students in the classroom."
        ctaLabel="Donate"
        ctaHref="/donate"
        tone="cream"
        titleId="blog-post-cta-title"
      />
    </>
  );
}
