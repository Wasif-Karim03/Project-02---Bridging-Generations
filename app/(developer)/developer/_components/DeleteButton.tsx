"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({
  entityKey,
  slug,
  label,
}: {
  entityKey: string;
  slug: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Delete "${label}"? This removes it from the website. This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    const res = await fetch("/api/developer/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityKey, slug }),
    });
    if (res.ok) {
      router.replace(`/developer/${entityKey}`);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      alert(data.error ?? "Delete failed.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-accent-2-text text-sm underline underline-offset-4 disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
