"use client";

import { useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { AdminIcon, type AdminIconName } from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  /** "exact" highlights only on an exact path match; "prefix" highlights on
   *  the route and any of its sub-pages. */
  match: "exact" | "prefix";
};

// Single source of truth for the admin nav. The order here is the order the
// links appear in the sidebar.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/admin", label: "Home", icon: "home", match: "exact" },
  { href: "/dashboard/admin/users", label: "Users", icon: "users", match: "prefix" },
  { href: "/dashboard/admin/students", label: "Students", icon: "students", match: "prefix" },
  { href: "/dashboard/admin/projects", label: "Projects", icon: "projects", match: "prefix" },
  { href: "/dashboard/admin/donors", label: "Donators", icon: "donators", match: "prefix" },
  { href: "/dashboard/admin/donor-wall", label: "Donor Wall", icon: "donorWall", match: "prefix" },
  { href: "/dashboard/admin/pages", label: "Pages", icon: "pages", match: "prefix" },
  { href: "/dashboard/admin/gallery", label: "Gallery", icon: "gallery", match: "prefix" },
  { href: "/dashboard/admin/slides", label: "Slides", icon: "slides", match: "prefix" },
  { href: "/dashboard/admin/posts", label: "Post", icon: "post", match: "prefix" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "settings", match: "prefix" },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-3.5 text-body-sm transition-colors ${
        active
          ? "bg-accent/10 font-semibold text-accent"
          : "text-ink-2 hover:bg-ground-3 hover:text-ink"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-accent transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <AdminIcon
        name={item.icon}
        className={`size-[18px] shrink-0 ${active ? "text-accent" : "text-ink-2 group-hover:text-ink"}`}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

// Isolated so useClerk() only runs when Clerk is actually configured —
// calling it without a <ClerkProvider /> ancestor throws. The parent renders
// this only when clerkOn is true.
function SignOutButton({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        onNavigate?.();
        await signOut();
        router.push("/admin-login");
      }}
      className="group flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 pl-3.5 text-left text-body-sm text-ink-2 transition-colors hover:bg-accent-2/10 hover:text-accent-2-text"
    >
      <AdminIcon
        name="signOut"
        className="size-[18px] shrink-0 text-ink-2 group-hover:text-accent-2-text"
      />
      <span className="truncate">Sign out</span>
    </button>
  );
}

function NavBody({
  pathname,
  clerkOn,
  onNavigate,
}: {
  pathname: string;
  clerkOn: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="px-3.5 pb-2 font-semibold text-ink-2 text-[10px] uppercase tracking-[0.14em]">
        Manage
      </p>
      <nav aria-label="Admin sections">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item, pathname)} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 space-y-0.5 border-hairline border-t pt-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-3.5 text-body-sm text-ink-2 transition-colors hover:bg-ground-3 hover:text-ink"
        >
          <AdminIcon
            name="viewSite"
            className="size-[18px] shrink-0 text-ink-2 group-hover:text-ink"
          />
          <span className="truncate">View site</span>
        </Link>
        {clerkOn ? <SignOutButton onNavigate={onNavigate} /> : null}
      </div>
    </div>
  );
}

export function AdminSidebar({
  adminName,
  adminBadge,
  clerkOn,
}: {
  adminName: string;
  adminBadge: string | null;
  clerkOn: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = (
    <div className="flex items-center gap-3 px-2 pb-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
        <AdminIcon name="home" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink text-body-sm leading-tight">{adminName}</p>
        <p className="text-[10px] uppercase tracking-[0.12em] text-ink-2">
          {adminBadge ?? "Admin panel"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: persistent left column */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-hairline bg-ground-2 p-3">
          {brand}
          <NavBody pathname={pathname} clerkOn={clerkOn} />
        </div>
      </aside>

      {/* Mobile: collapsible panel */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-hairline bg-ground-2 px-4 py-3"
        >
          <span className="flex items-center gap-2 font-semibold text-ink text-body-sm">
            <AdminIcon name="menu" className="size-5 text-ink-2" />
            Admin menu
          </span>
          <AdminIcon
            name="chevron"
            className={`size-5 text-ink-2 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileOpen ? (
          <div className="mt-3 rounded-2xl border border-hairline bg-ground-2 p-3">
            {brand}
            <NavBody
              pathname={pathname}
              clerkOn={clerkOn}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
