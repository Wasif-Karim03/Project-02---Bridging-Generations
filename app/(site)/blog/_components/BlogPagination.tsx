import { Link } from "next-view-transitions";

type BlogPaginationProps = {
  currentPage: number;
  pageCount: number;
};

export function BlogPagination({ currentPage, pageCount }: BlogPaginationProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav
      aria-label="Blog pagination"
      className="border-hairline border-t px-4 py-10 sm:px-6 lg:px-[6%]"
    >
      <ul className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 text-body-sm">
        {pages.map((page) => {
          const href = page === 1 ? "/blog" : `/blog/page/${page}`;
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`inline-flex size-10 items-center justify-center border border-hairline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent ${
                  isCurrent ? "bg-accent text-white" : "text-ink-2 transition hover:text-accent"
                }`}
              >
                {page}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
