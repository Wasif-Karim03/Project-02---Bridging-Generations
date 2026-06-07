"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string };
type NavGroup = { group: string; items: NavItem[] };

type Props = {
  global: NavItem[];
  groups: NavGroup[];
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/developer") return pathname === "/developer";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  global,
  groups,
  pathname,
  query,
  onNavigate,
}: Props & { pathname: string; query: string; onNavigate?: () => void }) {
  const q = query.trim().toLowerCase();
  const linkClass = (active: boolean) =>
    `block rounded-lg px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-accent/10 font-medium text-accent"
        : "text-ink-2 hover:bg-ground-3 hover:text-ink"
    }`;

  const filteredGroups = groups
    .map((g) => ({
      ...g,
      items: q ? g.items.filter((it) => it.label.toLowerCase().includes(q)) : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const filteredGlobal = q ? global.filter((it) => it.label.toLowerCase().includes(q)) : global;

  return (
    <nav className="flex flex-col gap-6">
      {filteredGlobal.length > 0 ? (
        <div>
          <p className="px-3 pb-2 font-medium text-ink-2 text-[11px] uppercase tracking-[0.12em]">
            Global
          </p>
          <ul className="space-y-0.5">
            {filteredGlobal.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onNavigate}
                  className={linkClass(isActive(pathname, it.href))}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {filteredGroups.map((g) => (
        <div key={g.group}>
          <p className="px-3 pb-2 font-medium text-ink-2 text-[11px] uppercase tracking-[0.12em]">
            {g.group}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onNavigate}
                  className={linkClass(isActive(pathname, it.href))}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {filteredGroups.length === 0 && filteredGlobal.length === 0 ? (
        <p className="px-3 text-ink-2 text-sm">No matches.</p>
      ) : null}
    </nav>
  );
}

export function DeveloperSidebar(props: Props) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const search = (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search pages…"
      className="mb-4 w-full rounded-lg border border-hairline bg-ground-2 px-3 py-2 text-sm outline-none focus:border-accent"
    />
  );

  return (
    <>
      {/* Desktop: persistent left column */}
      <aside className="hidden lg:block">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-hairline border-r px-4 py-6">
          {search}
          <NavList {...props} pathname={pathname} query={query} />
        </div>
      </aside>

      {/* Mobile: collapsible menu bar */}
      <div className="border-hairline border-b px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-hairline bg-ground-2 px-3 py-2 text-sm"
        >
          <span className="font-medium">Menu</span>
          <span className="text-ink-2">{mobileOpen ? "▲" : "▼"}</span>
        </button>
        {mobileOpen ? (
          <div className="mt-3">
            {search}
            <NavList
              {...props}
              pathname={pathname}
              query={query}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
