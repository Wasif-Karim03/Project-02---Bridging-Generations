import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { listBlogPosts } from "@/lib/db/queries/blogPosts";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { BlogHero } from "./_components/BlogHero";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field updates and stories from Bridging Generations — from the classrooms of the Chittagong Hill Tracts.",
  alternates: pageAlternates("/blog"),
};

function excerpt(body: string | null, max = 180): string {
  if (!body) return "";
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations("blog");
  const posts = await listBlogPosts({ publishedOnly: true });

  const dateFmt = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const mostRecent = posts[0]?.createdAt ? dateFmt.format(new Date(posts[0].createdAt)) : null;

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <BlogHero count={posts.length} mostRecent={mostRecent} />

      <section aria-label="Blog posts" className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          {posts.length === 0 ? (
            <p className="text-body text-ink-2">No posts yet — check back soon.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-ground-2 transition-colors hover:border-accent"
                  >
                    {post.coverUrl ? (
                      // biome-ignore lint/performance/noImgElement: CDN-hosted cover URL
                      <img
                        src={post.coverUrl}
                        alt=""
                        className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="grid aspect-[3/2] w-full place-items-center bg-accent/10 text-meta uppercase text-accent">
                        Bridging Generations
                      </span>
                    )}
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                        {dateFmt.format(new Date(post.createdAt))}
                      </p>
                      <h2 className="text-balance text-heading-4 font-bold text-accent">
                        {post.title}
                      </h2>
                      {excerpt(post.body) ? (
                        <p className="line-clamp-3 text-body text-ink-2">{excerpt(post.body)}</p>
                      ) : null}
                      <span className="mt-auto pt-1 text-nav-link uppercase text-accent group-hover:underline">
                        Read more →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTAFooterPanel
        headline={t("ctaHeadline")}
        body={t("ctaBody")}
        ctaLabel={t("ctaLabel")}
        ctaHref="/donate"
        tone="cream"
        titleId="blog-cta-title"
      />
      <JsonLd id="ld-blog-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
