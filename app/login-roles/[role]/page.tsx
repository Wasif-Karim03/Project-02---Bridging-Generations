import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { findRoleBySlug, ROLE_CATALOG } from "@/lib/auth/roleCatalog";

type Params = { role: string };

export async function generateStaticParams() {
  return ROLE_CATALOG.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { role } = await params;
  const card = findRoleBySlug(role);
  if (!card) return { title: "Role — Bridging Generations" };
  return {
    title: `${card.label} — Bridging Generations`,
    description: card.blurb,
    alternates: { canonical: `/login-roles/${role}` },
  };
}

// Per-role landing. Live roles show "Sign in" + "Create account" buttons
// that point at the existing role-specific Clerk routes. Placeholder roles
// show a "Coming soon" panel + a link back to /login-roles.
export default async function RoleLandingPage({ params }: { params: Promise<Params> }) {
  const { role } = await params;
  const card = findRoleBySlug(role);
  if (!card) notFound();

  return (
    <div className="atmospheric-page">
      <section
        aria-labelledby="role-landing-title"
        className="px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-24"
      >
        <div className="mx-auto flex max-w-[640px] flex-col gap-8">
          <header className="flex flex-col gap-3">
            <Eyebrow>{card.status === "placeholder" ? "Coming soon" : "Role"}</Eyebrow>
            <h1 id="role-landing-title" className="text-balance text-display-2 text-ink">
              {card.label}
            </h1>
            <p className="text-body text-ink-2">{card.blurb}</p>
          </header>

          {card.status === "placeholder" ? (
            <PlaceholderPanel label={card.label} />
          ) : (
            <LivePanel signInPath={card.signInPath} signUpPath={card.signUpPath} />
          )}

          <p className="text-body-sm text-ink-2">
            <Link href="/login-roles" className="text-accent underline underline-offset-[3px]">
              ← All roles
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function LivePanel({ signInPath, signUpPath }: { signInPath: string; signUpPath: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link
        href={signInPath}
        className="group flex h-full flex-col gap-2 border border-hairline bg-ground-2 p-6 transition-colors hover:border-accent"
      >
        <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">Have an account</span>
        <span className="text-heading-5 text-ink group-hover:text-accent">Sign in</span>
        <span className="text-body-sm text-ink-2">
          Use the credentials you signed up with. Your dashboard opens automatically.
        </span>
      </Link>
      <Link
        href={signUpPath}
        className="group flex h-full flex-col gap-2 border border-hairline bg-ground-2 p-6 transition-colors hover:border-accent"
      >
        <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">New here</span>
        <span className="text-heading-5 text-ink group-hover:text-accent">Create account</span>
        <span className="text-body-sm text-ink-2">
          New accounts go to an admin for approval before access opens up.
        </span>
      </Link>
    </div>
  );
}

function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 border-2 border-accent bg-accent/5 px-5 py-6">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{label} · Coming soon</p>
      <p className="max-w-[60ch] text-body text-ink">
        The {label} workspace isn't open for signups yet. We're scoping the role + dashboard
        carefully before we let people in — partly because the workflows differ from the existing
        roles, and partly so we don't ship a half-finished surface.
      </p>
      <p className="text-body-sm text-ink-2">
        Want to be notified when it opens?{" "}
        <Link
          href="/contact"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Drop us a note via /contact
        </Link>{" "}
        and we'll reach out.
      </p>
    </div>
  );
}
