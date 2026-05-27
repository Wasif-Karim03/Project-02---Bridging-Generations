import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { isSessionVerifiedForAdmin } from "@/lib/db/queries/adminOtp";
import { AdminVerifyForm } from "./_components/AdminVerifyForm";

export const metadata: Metadata = {
  title: "Admin verification",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Step-up auth for admins. Hit this after Clerk sign-in, before the admin
// layout. Sends a 6-digit code to the admin's email; on correct entry,
// flips this session as "verified" so the admin layout lets them through.
// Non-admin accounts get redirected away — there's no reason for them to
// be here.
export default async function AdminVerifyPage() {
  await requireUserId();
  const dbUser = await getCurrentDbUser();
  if (!dbUser) redirect("/sign-in");
  if (dbUser.role !== "admin" && dbUser.role !== "it") {
    redirect("/dashboard");
  }
  // If this session is already verified, no point staying here.
  if (isDbConfigured()) {
    const { auth } = await import("@clerk/nextjs/server");
    const { sessionId } = await auth();
    if (sessionId) {
      const ok = await isSessionVerifiedForAdmin({ userId: dbUser.id, sessionId });
      if (ok) redirect("/dashboard/admin");
    }
  }

  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <Eyebrow>Admin portal · Step-up</Eyebrow>
        <h1 className="text-balance text-display-2 text-ink">One more step.</h1>
        <p className="text-body text-ink-2">
          Admin sessions require an extra check. We email a 6-digit code to your account email; you
          enter it below and the admin dashboard opens.
        </p>
      </header>

      <AdminVerifyForm emailHint={dbUser.email} />

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        Stays valid for this browser session only. Close the tab and you'll need a fresh code.
      </p>
    </div>
  );
}
