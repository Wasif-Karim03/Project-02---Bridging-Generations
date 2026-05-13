import { Eyebrow } from "@/components/ui/Eyebrow";
import { MobileImage } from "@/components/ui/MobileImage";
import type { BlogPost } from "@/lib/content/blogPosts";
import { toFocalPoint } from "@/lib/content/focalPoint";

type BlogPostHeaderProps = {
  post: BlogPost;
};

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const primaryTag = post.tags?.[0];
  const mobileFocalPoint = toFocalPoint(post.coverMobileFocalPoint);
  return (
    <header className="bg-ground px-4 pt-16 pb-8 sm:px-6 lg:px-[6%] lg:pt-24 lg:pb-12">
      <div className="mx-auto flex max-w-[65ch] flex-col gap-6">
        {primaryTag ? <Eyebrow>{primaryTag}</Eyebrow> : null}
        <h1 className="text-balance text-display-2 text-ink">{post.title}</h1>
      </div>
      {/* Cover bleeds wider than the 65ch text column to --cover-bleed (90ch) —
          a single deliberate edge-bleed instead of three competing measures.
          MobileImage gives 4:5 below sm: (focal point from frontmatter) and
          snaps back to 16:9 at sm:+ for the desktop bleed. */}
      <div className="mx-auto mt-10 max-w-[90ch] overflow-hidden bg-ground-3 lg:mt-14">
        <MobileImage
          src={post.coverImage.src}
          alt={post.coverImage.alt}
          ladder="portrait"
          mobileFocalPoint={mobileFocalPoint}
          priority
          fetchPriority="high"
          sizes="(min-width: 1280px) 1120px, 100vw"
        />
      </div>
    </header>
  );
}
