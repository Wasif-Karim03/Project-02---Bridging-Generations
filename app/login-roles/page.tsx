import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ROLE_CATALOG } from "@/lib/auth/roleCatalog";

export const metadata: Metadata = {
  title: "Sign in or sign up — Bridging Generations",
  description: "Pick the role you're joining as: donor, student, mentor, admin, and more.",
  alternates: { canonical: "/login-roles" },
};

// Unified entry hub for every account type. Replaces the scattered
// "donor signs up here / mentor signs up there" links across the site.
// Each card links to /login-roles/<slug> for the per-role landing page
// where the visitor picks sign-in vs create-account.
export default function LoginRolesPage() {
  return (
    <div className="atmospheric-page">
      <section
        aria-labelledby="login-roles-title"
        className="px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-24"
      >
        <div className="mx-auto flex max-w-[1080px] flex-col gap-10">
          <header className="flex max-w-[60ch] flex-col gap-3">
            <Eyebrow>Join Bridging Generations</Eyebrow>
            <h1 id="login-roles-title" className="text-balance text-display-2 text-ink">
              Pick how you're joining us.
            </h1>
            <p className="text-body-lg text-ink-2">
              Whether you're sponsoring a student, applying for a scholarship, or coming on board as
              part of the team — start by picking your role. We'll route you to the right place.
            </p>
          </header>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_CATALOG.map((role) => (
              <li key={role.slug}>
                <Link
                  href={`/login-roles/${role.slug}`}
                  className="group flex h-full flex-col gap-3 border border-hairline bg-ground-2 p-6 transition-colors hover:border-accent"
                  aria-label={
                    role.status === "placeholder"
                      ? `${role.label} (coming soon)`
                      : `Sign in or sign up as ${role.label}`
                  }
                >
                  <span className="flex items-center gap-2">
                    <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">
                      {role.status === "placeholder" ? "Coming soon" : "Role"}
                    </span>
                  </span>
                  <span className="text-heading-5 text-ink group-hover:text-accent">
                    {role.label}
                  </span>
                  <span className="text-body-sm text-ink-2">{role.blurb}</span>
                  <span className="mt-auto text-nav-link uppercase text-accent">
                    {role.status === "placeholder" ? "Read more →" : "Open →"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="max-w-[60ch] text-body-sm text-ink-2">
            Already have an account but unsure which workspace it belongs to? Sign in via the role
            you signed up under — your dashboard will route automatically.
          </p>
        </div>
      </section>
    </div>
  );
}
