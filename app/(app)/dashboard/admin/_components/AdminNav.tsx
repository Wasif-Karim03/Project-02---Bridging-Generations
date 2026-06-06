"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

type NavItem = {
  href: string;
  label: string;
  /** How to test whether the current path should highlight this item.
   *  - "exact"   → only when pathname === href
   *  - "prefix"  → pathname starts with `activePrefix`
   *  - null      → never (hash-anchor scroll links — keep for navigation, no
   *                meaningful "you are here" state) */
  match: { kind: "exact" } | { kind: "prefix"; activePrefix: string } | null;
};

// Single source of truth for the admin nav. Keeping this colocated with the
// layout that renders it (rather than splitting into a fixtures file) makes
// adding a new admin page a single-file change.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", match: { kind: "exact" } },
  {
    href: "/dashboard/admin/applications",
    label: "Applications",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/applications" },
  },
  {
    href: "/dashboard/admin/donations",
    label: "Donations",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/donations" },
  },
  {
    // Hash link scrolls to the Donors section on Overview, but the tab still
    // highlights when viewing a donor detail page at /dashboard/admin/donors/[id].
    href: "/dashboard/admin#donors-title",
    label: "Donors",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/donors/" },
  },
  {
    href: "/dashboard/admin/students",
    label: "Students",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/students" },
  },
  {
    href: "/dashboard/admin/mentors",
    label: "Mentors",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/mentors" },
  },
  {
    href: "/dashboard/admin/map",
    label: "Map",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/map" },
  },
  {
    href: "/dashboard/admin/users",
    label: "Users & roles",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/users" },
  },
  {
    href: "/dashboard/admin/audit",
    label: "Audit log",
    match: { kind: "prefix", activePrefix: "/dashboard/admin/audit" },
  },
  { href: "/dashboard/admin#exports-title", label: "Exports", match: null },
];

function itemIsActive(item: NavItem, pathname: string): boolean {
  if (!item.match) return false;
  if (item.match.kind === "exact") return pathname === item.href;
  return pathname.startsWith(item.match.activePrefix);
}

export function AdminNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-wrap gap-x-5 gap-y-2 border-b border-hairline pb-3 text-meta uppercase tracking-[0.08em]"
    >
      {NAV_ITEMS.map((item) => {
        const active = itemIsActive(item, pathname);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative transition-colors ${
              active ? "font-semibold text-accent" : "text-ink-2 hover:text-accent"
            }`}
          >
            {item.label}
            {active ? (
              <span
                aria-hidden="true"
                // Sits 14px below the text — past the parent's pb-3 (12px) so
                // it overlays the parent's 1px hairline bottom-border with
                // 2px of coral. Matches the ActiveMotif treatment used on
                // the public-site primary nav.
                className="pointer-events-none absolute -bottom-[14px] left-0 right-0 h-[2px] bg-accent"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
