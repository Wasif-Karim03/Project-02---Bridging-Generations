"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Uploads project images to Cloudflare R2 via /api/admin/project-image.
// kind="cover" replaces the cover; kind="gallery" appends (supports multiple).
export function ImageUploader({
  projectId,
  kind,
  label,
}: {
  projectId: string;
  kind: "cover" | "gallery";
  label: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("projectId", projectId);
        fd.append("kind", kind);
        fd.append("file", file);
        const res = await fetch("/api/admin/project-image", { method: "POST", body: fd });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex min-h-[40px] items-center rounded-lg border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
      >
        {busy ? "Uploading…" : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple={kind === "gallery"}
        onChange={onPick}
        className="hidden"
      />
      {error ? (
        <p className="text-meta text-red-700">{error}</p>
      ) : (
        <p className="text-meta text-ink-2">
          {kind === "gallery" ? "Select one or more images · up to 10 MB each" : "Up to 10 MB"}
        </p>
      )}
    </div>
  );
}
