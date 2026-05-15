import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Be a donor",
  description: "Sign in or create your donor account to sponsor a student.",
};

// Entry point for the donor flow. Every "Be a donor" button on the public
// site lands here. Two clear paths: sign in for returning donors, or create
// an account for new donors. After auth, both paths route to the donor
// dashboard where they can browse students and track gifts.

export default function BeADonorPage() {
  return (
    <main className="mx-auto w-full max-w-[960px] px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24">
      <header className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>Be a donor</Eyebrow>
        <h1 className="text-balance text-display-2 text-ink">Sponsor a student.</h1>
        <p className="max-w-[58ch] text-body-lg text-ink-2">
          Bridging Generations donors get a dashboard with the students they sponsor, their full
          giving history, and PDF receipts for every gift. Pick the option below that matches you.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Link
          href="/sign-in"
          className="group flex flex-col gap-4 border-2 border-accent bg-ground-2 p-7 transition-colors hover:bg-accent hover:text-white"
        >
          <p className="text-eyebrow uppercase tracking-[0.1em] text-accent group-hover:text-white">
            Returning donor
          </p>
          <h2 className="text-heading-3 text-ink group-hover:text-white">I have an account.</h2>
          <p className="text-body text-ink-2 group-hover:text-white/85">
            Sign in with your email and password to see your donor dashboard, manage recurring
            gifts, and download your receipts.
          </p>
          <span className="mt-auto text-nav-link uppercase text-accent group-hover:text-white">
            Sign in →
          </span>
        </Link>

        <Link
          href="/sign-up"
          className="group flex flex-col gap-4 border-2 border-hairline bg-ground-2 p-7 transition-colors hover:border-accent"
        >
          <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">New donor</p>
          <h2 className="text-heading-3 text-ink group-hover:text-accent">Create an account.</h2>
          <p className="text-body text-ink-2">
            Set up a free donor account in under a minute. You'll get a unique donor ID, a tax
            receipt for every gift, and the ability to follow specific students you sponsor.
          </p>
          <span className="mt-auto text-nav-link uppercase text-accent">Create account →</span>
        </Link>
      </div>

      <p className="mt-10 text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        Are you a mentor or board member?{" "}
        <Link
          href="/mentor-login"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Mentor sign-in
        </Link>{" "}
        ·{" "}
        <Link
          href="/admin-login"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Admin sign-in
        </Link>
      </p>
    </main>
  );
}
