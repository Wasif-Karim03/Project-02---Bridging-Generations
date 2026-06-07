"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/developer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-hairline bg-ground-2/50 p-8 shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </span>
        <h1 className="mt-4 font-semibold text-2xl">Site editor</h1>
        <p className="mt-1.5 text-ink-2 text-sm">
          Enter the editor password to update the website's text and images.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Editor password"
            // biome-ignore lint/a11y/noAutofocus: single-purpose sign-in screen
            autoFocus
            className="w-full rounded-lg border border-hairline bg-ground px-4 py-3 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {error ? <p className="text-accent-2-text text-sm">{error}</p> : null}
          <button
            type="submit"
            disabled={busy || !password}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
