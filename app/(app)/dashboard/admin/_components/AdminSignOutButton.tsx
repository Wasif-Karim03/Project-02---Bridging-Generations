"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Sign-out button for the admin shell. Uses Clerk's session signOut() then
// hard-redirects to the dedicated admin sign-in so the admin lands back at
// the staff portal rather than the donor sign-in page.
export function AdminSignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/admin-login");
      }}
      className="inline-flex min-h-[36px] items-center border border-white/40 px-3 text-nav-link uppercase text-white hover:border-white hover:bg-white hover:text-ink"
    >
      Sign out
    </button>
  );
}
