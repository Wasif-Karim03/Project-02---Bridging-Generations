"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/developer/logout", { method: "POST" });
        router.refresh();
      }}
      className="text-ink-2 text-sm underline underline-offset-4 hover:text-ink"
    >
      Sign out
    </button>
  );
}
