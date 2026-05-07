import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const destinations = [
  {
    label: "Read a student's story",
    href: "/success-stories",
    caption: "How a sponsorship plays out across a school year, in a student's own words.",
  },
  {
    label: "See recent activity",
    href: "/activities",
    caption: "Field updates from the partner schools — what we shipped, what's pending.",
  },
  {
    label: "Donate",
    href: "/donate",
    caption: "Sponsor a student — $30/mo covers tuition, books, meals, materials.",
  },
];

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="mx-auto flex max-w-[820px] flex-col gap-10 px-6 pt-20 pb-24 lg:px-[6%] lg:pt-28 lg:pb-32">
        <div className="flex flex-col gap-6">
          <h1 className="text-display-2 text-ink">
            This page is somewhere in the Hill Tracts, but not on this server.
          </h1>
          <p className="max-w-[44ch] text-body-lg text-ink-2">
            Routes shift, links go stale, students graduate. Try one of the standing destinations
            below — or write to the board.
          </p>
          <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-4 text-meta uppercase tracking-[0.1em] text-ink-2">
            <li>Page not found</li>
            <li>404</li>
          </ul>
        </div>

        <search>
          <form
            action="/"
            className="flex flex-wrap items-baseline gap-3 border-b border-hairline pb-2 focus-within:border-accent"
          >
            <label
              htmlFor="not-found-search"
              className="text-meta uppercase tracking-[0.1em] text-ink-2"
            >
              Or search:
            </label>
            <input
              id="not-found-search"
              type="search"
              name="q"
              aria-label="Search the site"
              placeholder="What were you looking for?"
              className="min-w-0 flex-1 bg-transparent py-1 text-body text-ink placeholder:text-ink-2 focus:outline-none"
            />
          </form>
        </search>

        <nav aria-label="Standing destinations">
          <ul className="flex flex-col divide-y divide-hairline border-t border-hairline">
            {destinations.map((d) => (
              <li key={d.href} className="py-5">
                <a
                  href={d.href}
                  className="block text-heading-3 font-bold text-ink transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
                >
                  {d.label}
                </a>
                <p className="mt-1 max-w-[60ch] text-body text-ink-2">{d.caption}</p>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </SiteChrome>
  );
}
