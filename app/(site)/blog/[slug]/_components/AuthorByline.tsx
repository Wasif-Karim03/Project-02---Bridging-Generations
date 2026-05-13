import type { BoardMember } from "@/lib/content/boardMembers";

type AuthorBylineProps = {
  author: BoardMember | null;
};

export function AuthorByline({ author }: AuthorBylineProps) {
  // Colophon-style author note. Hairline rule above, no full-bleed band, set
  // at the spine width so it reads as part of the article composition rather
  // than a separate slab of chrome.
  if (!author) {
    return (
      <aside aria-label="About the author" className="bg-ground px-4 sm:px-6 lg:px-[6%]">
        <div className="mx-auto max-w-[65ch] border-hairline border-t py-8 lg:py-10">
          <p className="text-eyebrow uppercase tracking-[0.18em] text-accent-2-text">
            A note on authorship
          </p>
          <p className="mt-3 text-body text-ink">
            Written by <span className="font-semibold">The Bridging Generations team</span>.
          </p>
        </div>
      </aside>
    );
  }
  return (
    <aside aria-label="About the author" className="bg-ground px-4 sm:px-6 lg:px-[6%]">
      <div className="mx-auto max-w-[65ch] border-hairline border-t py-8 lg:py-10">
        <p className="text-eyebrow uppercase tracking-[0.18em] text-accent-2-text">
          A note from the author
        </p>
        <p className="mt-3 text-body text-ink">
          <span className="font-semibold">{author.name}</span>
          {author.role ? <span className="text-ink-2"> &nbsp;·&nbsp; {author.role}</span> : null}
        </p>
        {author.bio ? (
          <p className="mt-3 max-w-[58ch] text-body-sm text-ink-2">{author.bio}</p>
        ) : null}
      </div>
    </aside>
  );
}
