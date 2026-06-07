"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./icons";

type NavItem = { href: string; label: string; icon?: IconName };
type NavGroup = { group: string; items: NavItem[] };

type Props = {
  global: NavItem[];
  groups: NavGroup[];
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/developer") return pathname === "/developer";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group relative flex items-center gap-2.5 rounded-lg py-2 pr-3 pl-3 text-sm transition-colors ${
        active
          ? "bg-accent/10 font-medium text-accent"
          : "text-ink-2 hover:bg-ground-3 hover:text-ink"
      }`}
    >
      <span
        className={`absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-accent transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      {item.icon ? (
        <Icon
          name={item.icon}
          className={`size-4 shrink-0 ${active ? "text-accent" : "text-ink-2 group-hover:text-ink"}`}
        />
      ) : null}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavList({
  global,
  groups,
  pathname,
  query,
  onNavigate,
}: Props & { pathname: string; query: string; onNavigate?: () => void }) {
  const q = query.trim().toLowerCase();
  const filteredGroups = groups
    .map((g) => ({
      ...g,
      items: q ? g.items.filter((it) => it.label.toLowerCase().includes(q)) : g.items,
    }))
    .filter((g) => g.items.length > 0);
  const filteredGlobal = q ? global.filter((it) => it.label.toLowerCase().includes(q)) : global;

  return (
    <nav className="flex flex-col gap-5">
      {filteredGlobal.length > 0 ? (
        <div>
          <p className="px-3 pb-1.5 font-semibold text-ink-2 text-[10px] uppercase tracking-[0.14em]">
            Global
          </p>
          <ul className="space-y-0.5">
            {filteredGlobal.map((it) => (
              <li key={it.href}>
                <NavLink item={it} active={isActive(pathname, it.href)} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {filteredGroups.map((g) => (
        <div key={g.group}>
          <p className="px-3 pb-1.5 font-semibold text-ink-2 text-[10px] uppercase tracking-[0.14em]">
            {g.group}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <NavLink item={it} active={isActive(pathname, it.href)} onNavigate={onNavigate} />
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
    <div className="relative mb-4">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="size-4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>
      </span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search pages…"
        className="w-full rounded-lg border border-hairline bg-ground-2 py-2 pr-3 pl-9 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );

  return (
    <>
      {/* Desktop: persistent left column */}
      <aside className="hidden lg:block">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-hairline border-r bg-ground-2/30 px-4 py-6">
          {search}
          <NavList {...props} pathname={pathname} query={query} />
        </div>
      </aside>

      {/* Mobile: collapsible menu bar */}
      <div className="border-hairline border-b bg-ground-2/40 px-4 py-3 lg:hidden">
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
