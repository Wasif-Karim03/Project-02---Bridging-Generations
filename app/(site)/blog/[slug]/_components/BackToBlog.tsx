import { Link } from "next-view-transitions";

export function BackToBlog() {
  return (
    <div className="bg-ground px-4 pt-10 sm:px-6 lg:px-[6%]">
      <div className="mx-auto max-w-[1100px]">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 text-nav-link uppercase text-accent transition hover:text-accent-2-text"
        >
          <span
            aria-hidden="true"
            className="transition-transform motion-safe:group-hover:-translate-x-1"
          >
            ←
          </span>
          All posts
        </Link>
      </div>
    </div>
  );
}
