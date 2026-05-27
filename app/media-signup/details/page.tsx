import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { getMediaProfile } from "@/lib/db/queries/mediaFolders";
import { MediaSignupForm } from "./_components/MediaSignupForm";

export const metadata: Metadata = {
  title: "Media — Profile details",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MediaDetailsPage() {
  await requireUserId();
  const dbUser = await getCurrentDbUser();
  if (dbUser && isDbConfigured()) {
    const existing = await getMediaProfile(dbUser.id);
    if (existing) redirect("/pending-approval");
  }
  const initialEmail = dbUser?.email ?? undefined;
  const initialName = dbUser?.displayName ?? undefined;

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="media-hero-title"
        className="bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[1280px]">
          <Reveal stagger="up">
            <Eyebrow>Step 2 of 2 · Media details</Eyebrow>
            <h1
              id="media-hero-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              Tell us a bit about your background.
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">
              Everything here goes only to our board for review. Once you're approved you'll be able
              to sign in and start organizing event media.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20">
        <div className="mx-auto max-w-[820px]">
          <MediaSignupForm initialEmail={initialEmail} initialName={initialName} />
        </div>
      </section>
    </div>
  );
}
