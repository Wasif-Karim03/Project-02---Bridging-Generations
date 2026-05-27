import "server-only";

// Single source of truth for the /login-roles hub. Each entry describes one
// card on the picker page. `status` separates roles that are wired end-to-end
// from placeholders that show a "Coming soon" landing instead of a signup form.
//
// IMPORTANT: the slug here is the URL segment (`/login-roles/<slug>`) AND the
// role string written to users.role in the DB. Keep them aligned. New role
// slugs must already be present in userRoleEnum (db/schema.ts) before they
// land here.

export type RoleCardStatus = "live" | "placeholder";

export type RoleCard = {
  slug: string;
  label: string;
  blurb: string;
  signInPath: string;
  signUpPath: string;
  status: RoleCardStatus;
};

// Display order on /login-roles. Live roles first, placeholders second —
// signals progress without hiding the future scope.
export const ROLE_CATALOG: RoleCard[] = [
  {
    slug: "donor",
    label: "Donor",
    blurb: "Sponsor a student. Track your giving + see who you support.",
    signInPath: "/sign-in",
    signUpPath: "/sign-up",
    status: "live",
  },
  {
    slug: "student",
    label: "Student",
    blurb: "Apply for a scholarship or sign in to track your application.",
    signInPath: "/student-login",
    signUpPath: "/student-signup",
    status: "live",
  },
  {
    slug: "mentor",
    label: "Mentor",
    blurb: "Mentor a student through weekly check-ins and 15-day calls.",
    signInPath: "/mentor-login",
    signUpPath: "/mentor-signup",
    status: "live",
  },
  {
    slug: "admin",
    label: "Admin",
    blurb: "Review signups, manage users, and oversee the program.",
    signInPath: "/admin-login",
    // Admin self-signup is gated by BOOTSTRAP_ADMIN_EMAIL; the form is the
    // ordinary /sign-up flow, but only the env-matching email auto-approves.
    signUpPath: "/sign-up",
    status: "live",
  },
  {
    slug: "accountant",
    label: "Accounting",
    blurb: "Record donations, run reports, reconcile the books.",
    signInPath: "/accountant-login",
    signUpPath: "/accountant-signup",
    status: "live",
  },
  {
    slug: "media",
    label: "Media",
    blurb: "Organize event photos + media into project folders.",
    signInPath: "/media-login",
    signUpPath: "/media-signup",
    status: "live",
  },
  {
    slug: "lead",
    label: "Lead",
    blurb: "Coming soon — site leads coordinating local partnerships.",
    signInPath: "",
    signUpPath: "",
    status: "placeholder",
  },
  {
    slug: "it",
    label: "IT Team",
    blurb: "Coming soon — platform infrastructure and ops.",
    signInPath: "",
    signUpPath: "",
    status: "placeholder",
  },
  {
    slug: "pm",
    label: "Project Management",
    blurb: "Coming soon — workspace for ongoing program initiatives.",
    signInPath: "",
    signUpPath: "",
    status: "placeholder",
  },
  {
    slug: "comm",
    label: "Communication",
    blurb: "Coming soon — outreach + community correspondence.",
    signInPath: "",
    signUpPath: "",
    status: "placeholder",
  },
];

export function findRoleBySlug(slug: string): RoleCard | undefined {
  return ROLE_CATALOG.find((r) => r.slug === slug);
}
