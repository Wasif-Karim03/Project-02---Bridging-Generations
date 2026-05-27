import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCurrentDbUser, isClerkConfigured, requireUserId } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Account under review — Bridging Generations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Search = { state?: string };

// Where pending / rejected / suspended users land. Three branches:
//   • pending — "your account is being reviewed"
//   • rejected — "your request was not approved" (with the admin's note if any)
//   • suspended — "your account access has been paused"
// Active users who hit this URL get redirected to their actual dashboard.
export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { state } = await searchParams;
  await requireUserId(); // bounce signed-out users to /sign-in

  const dbUser = await getCurrentDbUser();
  // Already approved? Let them get on with it.
  if (dbUser?.status === "active") {
    redirect("/dashboard");
  }

  // Allow the query string to override the DB read so the redirect from
  // requireRole can show the right message even if getCurrentDbUser races.
  const effective = state ?? dbUser?.status ?? "pending";
  const variant = effective === "rejected" || effective === "suspended" ? effective : "pending";

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <Eyebrow>{eyebrowFor(variant)}</Eyebrow>
        <h1 className="text-balance text-display-2 text-ink">{titleFor(variant)}</h1>
        <p className="text-body text-ink-2">{bodyFor(variant)}</p>
      </header>

      <section className="flex flex-col gap-3 border border-hairline bg-ground-2 p-6">
        <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">What happens next</p>
        <ul className="flex flex-col gap-2 text-body-sm text-ink-2">
          {nextStepsFor(variant).map((step) => (
            <li key={step}>· {step}</li>
          ))}
        </ul>
      </section>

      {!isClerkConfigured() ? (
        <p className="border border-accent-3 bg-accent-3/10 px-4 py-3 text-meta uppercase tracking-[0.06em] text-ink-2">
          Preview mode — sign-up flow not wired yet. This page is reachable for layout review only.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center border border-hairline px-5 text-nav-link uppercase text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Back to the site
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}

function eyebrowFor(v: "pending" | "rejected" | "suspended"): string {
  if (v === "rejected") return "Application · Not approved";
  if (v === "suspended") return "Account · Paused";
  return "Account · Under review";
}

function titleFor(v: "pending" | "rejected" | "suspended"): string {
  if (v === "rejected") return "Your request wasn't approved.";
  if (v === "suspended") return "Your account has been paused.";
  return "Thanks — your account is under review.";
}

function bodyFor(v: "pending" | "rejected" | "suspended"): string {
  if (v === "rejected") {
    return "Thank you for your interest in joining Bridging Generations. After reviewing your request, the board has decided not to move forward at this time. You're welcome to apply again in the future.";
  }
  if (v === "suspended") {
    return "Your account access has been paused by an administrator. If you believe this is a mistake, please reach out using the contact form below.";
  }
  return "An admin will review your request and let you know by email. This usually happens within a few business days. You can close this tab — you'll be able to sign back in once your account is approved.";
}

function nextStepsFor(v: "pending" | "rejected" | "suspended"): string[] {
  if (v === "rejected") {
    return [
      "Watch for the decision email — it includes any notes from the board.",
      "Reach out via /contact if you'd like guidance for a future application.",
      "Your sign-in credentials still work; if your status changes you'll be notified.",
    ];
  }
  if (v === "suspended") {
    return [
      "Your access is paused — dashboards are not reachable while in this state.",
      "An admin can lift the suspension at any time.",
      "Use /contact below to ask about the suspension if you need to.",
    ];
  }
  return [
    "An admin reviews each new signup personally.",
    "You'll get an email at the address you signed up with when a decision is made.",
    "If you submitted role-specific details (e.g., a student application), they'll be reviewed together.",
  ];
}
