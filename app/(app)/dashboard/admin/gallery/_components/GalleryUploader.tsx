"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GALLERY_TAGS } from "@/lib/gallery/tags";

// Uploads one or more gallery photos under a chosen tag, to the free CDN
// storage. Admin-only.
export function GalleryUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState<string>(GALLERY_TAGS[0]);
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
        fd.append("file", file);
        fd.append("tag", tag);
        const res = await fetch("/api/admin/gallery-image", { method: "POST", body: fd });
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
    <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-ground-2 p-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-meta uppercase tracking-[0.06em] text-ink-2">Tag</span>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="min-h-[44px] rounded-lg border border-hairline bg-ground px-3 text-body text-ink"
          >
            {GALLERY_TAGS.map((tg) => (
              <option key={tg} value={tg}>
                {tg}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          multiple
          onChange={onPick}
          className="hidden"
        />
      </div>
      {error ? (
        <p className="text-meta text-red-700">{error}</p>
      ) : (
        <p className="text-meta text-ink-2">
          Pick the tag first, then select one or more photos · up to 10 MB each
        </p>
      )}
    </div>
  );
}
