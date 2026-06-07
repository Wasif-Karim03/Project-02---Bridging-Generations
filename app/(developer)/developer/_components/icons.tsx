// Small inline-SVG icon set for the site editor. Stroke-based, 24×24, inherits
// currentColor. Keep additions here so the editor stays visually consistent.

export type IconName =
  | "dashboard"
  | "media"
  | "language"
  | "settings"
  | "nav"
  | "footer"
  | "tag"
  | "home"
  | "about"
  | "mission"
  | "users"
  | "folder"
  | "cap"
  | "mentor"
  | "activity"
  | "star"
  | "news"
  | "image"
  | "quote"
  | "gift"
  | "coins"
  | "mail"
  | "doc"
  | "text"
  | "list"
  | "page";

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  media: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  language: (
    <>
      <path d="M2 5h12" />
      <path d="M8 2v3" />
      <path d="M4.5 13c2.5-1 5-3.5 6-8" />
      <path d="M5 8c1 2.5 3.5 5 6 6" />
      <path d="m13 21 4-9 4 9" />
      <path d="M14.5 17h5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="8" cy="18" r="2" />
    </>
  ),
  nav: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
  footer: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 15h18" />
    </>
  ),
  tag: (
    <>
      <path d="M12 2 2 12l8 8 10-10V4a2 2 0 0 0-2-2z" />
      <circle cx="16" cy="8" r="1.4" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  mission: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </>
  ),
  folder: <path d="M4 5h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  cap: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5" />
    </>
  ),
  mentor: (
    <>
      <path d="M20.4 12.6 12 21l-8.4-8.4a4 4 0 0 1 5.7-5.7l2.7 2.7 2.7-2.7a4 4 0 0 1 5.7 5.7Z" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.5 9.2l5.9-.9z" />,
  news: (
    <>
      <path d="M4 4h13v16H5a1 1 0 0 1-1-1V4Z" />
      <path d="M17 8h3v9a2 2 0 0 1-2 2" />
      <path d="M7 8h6M7 12h6M7 16h4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  quote: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </>
  ),
  coins: (
    <>
      <circle cx="8" cy="8" r="5" />
      <path d="M20.6 11A6 6 0 1 1 14 19" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </>
  ),
  doc: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),
  text: (
    <>
      <path d="M4 7V5h16v2" />
      <path d="M9 19h6" />
      <path d="M12 5v14" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  page: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
};

export function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/** Icon for each page key (sidebar + headers). Falls back to a generic page. */
export const PAGE_ICON: Record<string, IconName> = {
  home: "home",
  about: "about",
  "mission-vision": "mission",
  students: "users",
  projects: "folder",
  scholarships: "cap",
  mentors: "mentor",
  activities: "activity",
  "success-stories": "star",
  blog: "news",
  gallery: "image",
  testimonials: "quote",
  donate: "gift",
  donors: "coins",
  contact: "mail",
  apply: "doc",
  legal: "doc",
  "site-settings": "settings",
  "header-nav": "nav",
  footer: "footer",
  "shared-labels": "tag",
};

export function pageIcon(key: string): IconName {
  return PAGE_ICON[key] ?? "page";
}
