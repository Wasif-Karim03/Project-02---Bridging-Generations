import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured, requireUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLanding() {
  // requireUserId() redirects to /sign-in when Clerk isn't configured or no
  // one is signed in. So if we reach this point, we have a userId.
  const userId = await requireUserId();
  const clerkOn = isClerkConfigured();

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Eyebrow>Dashboard</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Welcome back.</h1>
        <p className="text-body text-ink-2">
          Pick a workspace below. Your access depends on the role assigned by an admin.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashboardCard
          href="/dashboard/donor"
          eyebrow="Donor"
          title="Your donations"
          body="View donation history, download receipts, edit your public donor profile."
        />
        <DashboardCard
          href="/dashboard/mentor"
          eyebrow="Mentor"
          title="Mentor a student"
          body="See your assigned students and file the weekly report. Mentor role required."
        />
        <DashboardCard
          href="/dashboard/admin"
          eyebrow="Admin"
          title="Run the org"
          body="Review applications, assign mentors, export student/teacher lists. Admin role required."
        />
      </ul>

      {!clerkOn ? (
        <SetupNote>Clerk is not yet configured — these pages render in preview mode.</SetupNote>
      ) : null}
      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        Signed in as <span className="font-mono">{userId.slice(0, 16)}…</span>
      </p>
    </section>
  );
}

function DashboardCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col gap-3 border border-hairline bg-ground-2 p-6 transition-colors hover:border-accent"
      >
        <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">{eyebrow}</span>
        <span className="text-heading-5 text-ink group-hover:text-accent">{title}</span>
        <span className="text-body-sm text-ink-2">{body}</span>
        <span className="mt-auto text-nav-link uppercase text-accent">Open →</span>
      </Link>
    </li>
  );
}

function SetupNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
      {children}
    </p>
  );
}
