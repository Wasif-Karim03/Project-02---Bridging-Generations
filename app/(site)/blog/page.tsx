import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Feature, Row } from "@/components/ui/editorial";
import { Reveal } from "@/components/ui/Reveal";
import { getAllBlogPosts, getFeaturedBlogPost } from "@/lib/content/blogPosts";
import { getAllBoardMembers } from "@/lib/content/boardMembers";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { BlogHero } from "./_components/BlogHero";
import { BlogPagination } from "./_components/BlogPagination";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return dateFmt.format(d);
}

const POSTS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field updates and transparency notes from Bridging Generations — written by the board and partner-school staff.",
};

export default async function BlogPage() {
  const [posts, featured, board] = await Promise.all([
    getAllBlogPosts(),
    getFeaturedBlogPost(),
    getAllBoardMembers(),
  ]);

  const authorName = (id?: string | null) =>
    board.find((m) => m.id === id)?.name ?? "The Bridging Generations team";

  const featuredSlug = featured?.slug;
  const rest = posts.filter((p) => p.slug !== featuredSlug);
  const pageCount = Math.max(1, Math.ceil(rest.length / POSTS_PER_PAGE));
  const pageOne = rest.slice(0, POSTS_PER_PAGE);

  const mostRecent = posts[0]?.publishedAt ? formatDate(posts[0].publishedAt) : null;

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);
  const ldBlog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    url: new URL("/blog", SITE_URL).toString(),
    name: "Bridging Generations — Blog",
  };

  return (
    <>
      <BlogHero count={posts.length} mostRecent={mostRecent} />
      {featured ? (
        <section
          aria-label="Featured blog post"
          className="bg-ground px-4 pb-16 sm:px-6 lg:px-[6%] lg:pb-24"
        >
          <div className="mx-auto max-w-[1280px]">
            <Feature>
              <Reveal kind="develop">
                <Feature.Image
                  src={featured.coverImage.src}
                  alt={featured.coverImage.alt}
                  aspect="3/2"
                  bleed
                  priority
                />
              </Reveal>
              <Feature.Body>
                {featured.publishedAt ? (
                  <Feature.Eyebrow>{formatDate(featured.publishedAt)}</Feature.Eyebrow>
                ) : null}
                <Feature.Headline as="h2" href={`/blog/${featured.slug}`}>
                  {featured.title}
                </Feature.Headline>
                <Feature.Lede>{featured.excerpt}</Feature.Lede>
                <Feature.Stamp>{authorName(featured.author)}</Feature.Stamp>
              </Feature.Body>
            </Feature>
          </div>
        </section>
      ) : null}
      {pageOne.length > 0 ? (
        <section
          aria-label="All blog posts"
          className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
        >
          <ul className="mx-auto flex max-w-[1280px] flex-col">
            {pageOne.map((post) => (
              <Row as="li" key={post.slug}>
                <Reveal kind="develop">
                  <Row.Image src={post.coverImage.src} alt={post.coverImage.alt} aspect="3/2" />
                </Reveal>
                <Row.Body>
                  <Row.Eyebrow>
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                    {post.publishedAt ? <span aria-hidden="true"> · </span> : null}
                    <span>{authorName(post.author)}</span>
                  </Row.Eyebrow>
                  <Row.Headline href={`/blog/${post.slug}`}>{post.title}</Row.Headline>
                  <Row.Lede>{post.excerpt}</Row.Lede>
                </Row.Body>
              </Row>
            ))}
          </ul>
        </section>
      ) : null}
      <BlogPagination currentPage={1} pageCount={pageCount} />
      <CTAFooterPanel
        headline="Get the field updates before they land in the blog."
        body="Annual transparency reports, new projects, and student milestones — delivered to our supporters every quarter. Or keep scrolling here, it all lands on this page first."
        ctaLabel="Donate now"
        ctaHref="/donate"
        tone="cream"
        titleId="blog-cta-title"
      />
      <JsonLd id="ld-blog-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-blog" data={ldBlog} />
    </>
  );
}
