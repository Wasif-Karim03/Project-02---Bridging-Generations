"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Uploads a blog post's cover to the free CDN storage with an instant preview.
export function BlogCoverUploader({
  postId,
  coverUrl,
}: {
  postId: string;
  coverUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("postId", postId);
      fd.append("file", file);
      const res = await fetch("/api/admin/blog-image", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setPreview(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shown = preview ?? coverUrl;

  return (
    <div className="flex flex-wrap items-center gap-5">
      {shown ? (
        // biome-ignore lint/performance/noImgElement: CDN-hosted cover URL
        <img src={shown} alt="" className="h-32 w-48 rounded-lg object-cover" />
      ) : (
        <span className="grid h-32 w-48 place-items-center rounded-lg bg-accent/10 text-meta uppercase text-accent">
          No cover yet
        </span>
      )}
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
        >
          {busy ? "Uploading…" : coverUrl ? "Change cover" : "Upload cover"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          onChange={onPick}
          className="hidden"
        />
        {error ? (
          <p className="text-meta text-red-700">{error}</p>
        ) : (
          <p className="text-meta text-ink-2">JPG, PNG, WebP or GIF · up to 10 MB</p>
        )}
      </div>
    </div>
  );
}
