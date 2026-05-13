import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dropcap } from "@/components/content/Dropcap";
import { MarginaliaRail } from "@/components/content/MarginaliaRail";
import { MDXRenderer } from "@/components/content/MDXRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionAct } from "@/components/ui/SectionAct";
import { getAllBlogPostsRaw, getBlogPostBySlug, getRecentBlogPosts } from "@/lib/content/blogPosts";
import { getAllBoardMembers, getBoardMemberById } from "@/lib/content/boardMembers";
import { readingTime } from "@/lib/content/readingTime";
import { articleLd, breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { AuthorByline } from "./_components/AuthorByline";
import { BackToBlog } from "./_components/BackToBlog";
import { BlogPostHeader } from "./_components/BlogPostHeader";

type Params = { slug: string };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllBlogPostsRaw();
  return all.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      images: post.ogImageOverride?.src ? [post.ogImageOverride.src] : [post.coverImage.src],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [author, related] = await Promise.all([
    getBoardMemberById(post.author),
    getRecentBlogPosts({ exclude: slug, limit: 3 }),
  ]);
  const authorName = author?.name ?? "The Bridging Generations team";
  const board = await getAllBoardMembers();
  const boardName = (id?: string | null) =>
    board.find((m) => m.id === id)?.name ?? "The Bridging Generations team";

  const body = await post.body();
  const dateline = post.publishedAt ? dateFmt.format(new Date(post.publishedAt)) : "";
  const { label: readTimeLabel } = readingTime(body);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);
  const ldArticle = articleLd({
    siteUrl: SITE_URL,
    url: `/blog/${post.slug}`,
    headline: post.title,
    datePublished: post.publishedAt ?? undefined,
    authorName,
    imageUrl: post.coverImage.src,
    publisherName: "Bridging Generations",
  });

  const renderedBody = post.dropcap ? (
    <Dropcap>
      <MDXRenderer source={body} />
    </Dropcap>
  ) : (
    <MDXRenderer source={body} />
  );

  return (
    <>
      <BackToBlog />
      <BlogPostHeader post={post} />
      <article className="bg-ground px-4 pt-8 pb-16 sm:px-6 lg:px-[6%] lg:pt-12 lg:pb-24">
        <div className="longform-spine">
          <MarginaliaRail
            dateline={dateline}
            authorName={authorName}
            readTime={readTimeLabel}
            shareTitle={post.title}
          />
          <SectionAct className="text-ink-2">{renderedBody}</SectionAct>
        </div>
      </article>
      <AuthorByline author={author} />
      {related[0] ? (
        <section
          aria-labelledby="blog-related-title"
          className="bg-ground px-4 pt-12 pb-20 sm:px-6 lg:px-[6%] lg:pt-16 lg:pb-28"
        >
          <div className="mx-auto max-w-[65ch] border-hairline border-t pt-10 lg:pt-14">
            <p
              id="blog-related-title"
              className="text-eyebrow tracking-[0.18em] text-ink-2 uppercase"
            >
              Continue reading
            </p>
            <h2 className="mt-5 text-balance text-heading-2 text-ink">
              <a href={`/blog/${related[0].slug}`} className="transition hover:text-accent-2-text">
                {related[0].title}
              </a>
            </h2>
            <p className="mt-4 max-w-[60ch] text-body text-ink-2">{related[0].excerpt}</p>
            <p className="mt-5 text-meta uppercase text-ink-2">
              {related[0].publishedAt
                ? new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(related[0].publishedAt))
                : ""}
              {related[0].publishedAt ? <span aria-hidden="true"> · </span> : null}
              <span>{boardName(related[0].author)}</span>
            </p>
          </div>
        </section>
      ) : null}
      <JsonLd id={`ld-blog-${slug}-breadcrumb`} data={ldBreadcrumb} />
      <JsonLd id={`ld-blog-${slug}-article`} data={ldArticle} />
    </>
  );
}
