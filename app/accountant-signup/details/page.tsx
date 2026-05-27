import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { getAccountantProfile } from "@/lib/db/queries/accountantProfile";
import { AccountantSignupForm } from "./_components/AccountantSignupForm";

export const metadata: Metadata = {
  title: "Accountant — Profile details",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Step 2 of the accountant signup. The Clerk account is created on the
// previous page; here we collect the role-specific profile (full name,
// phone, address, photo, start/end dates, why-accountant). On submit we
// persist to accountant_profiles, flip users.role to 'accountant', and
// route the user to /pending-approval since they're still in 'pending'
// status until an admin approves.
export default async function AccountantDetailsPage() {
  await requireUserId();
  const dbUser = await getCurrentDbUser();
  // If the profile already exists, this is a re-visit — bounce to the
  // pending page so they aren't tempted to re-submit. The admin sees the
  // submission already.
  if (dbUser && isDbConfigured()) {
    const existing = await getAccountantProfile(dbUser.id);
    if (existing) redirect("/pending-approval");
  }
  const initialEmail = dbUser?.email ?? undefined;
  const initialName = dbUser?.displayName ?? undefined;

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="accountant-hero-title"
        className="bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[1280px]">
          <Reveal stagger="up">
            <Eyebrow>Step 2 of 2 · Accountant details</Eyebrow>
            <h1
              id="accountant-hero-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              Tell us a bit about your background.
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">
              Everything here goes only to our board for review. Once you're approved you'll be able
              to sign in and start recording donations.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20">
        <div className="mx-auto max-w-[820px]">
          <AccountantSignupForm initialEmail={initialEmail} initialName={initialName} />
        </div>
      </section>
    </div>
  );
}
