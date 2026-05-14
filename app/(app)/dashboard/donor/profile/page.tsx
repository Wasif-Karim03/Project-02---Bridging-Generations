import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireUserId } from "@/lib/auth";
import { getDonorProfile } from "@/lib/db/queries/donorProfiles";
import { DonorProfileEditor } from "./_components/DonorProfileEditor";

export const metadata: Metadata = {
  title: "Donor profile",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DonorProfilePage() {
  const userId = await requireUserId();
  const profile = await getDonorProfile(userId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb">
          <Link
            href="/dashboard/donor"
            className="text-meta uppercase tracking-[0.08em] text-ink-2 hover:text-accent"
          >
            ← Donor dashboard
          </Link>
        </nav>
        <Eyebrow>Profile</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Your public profile.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Donor amounts are never published. You control whether your name appears on /donors and
          may add a short dedication line that's visible to the public.
        </p>
      </header>

      <DonorProfileEditor initial={profile} />
    </div>
  );
}
