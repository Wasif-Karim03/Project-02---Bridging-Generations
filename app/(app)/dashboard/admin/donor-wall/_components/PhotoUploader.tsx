"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DonorAvatar } from "@/components/domain/DonorAvatar";

// Client photo uploader: pick a file from the device → instant local preview →
// POST to /api/admin/donor-photo (commits + stores a CDN URL) → refresh.
export function PhotoUploader({
  donorId,
  name,
  photoUrl,
}: {
  donorId: string;
  name: string;
  photoUrl: string | null;
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
      fd.append("donorId", donorId);
      fd.append("file", file);
      const res = await fetch("/api/admin/donor-photo", { method: "POST", body: fd });
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

  return (
    <div className="flex items-center gap-4">
      <DonorAvatar
        name={name}
        photoUrl={preview ?? photoUrl}
        className="size-16"
        monogramClassName="text-heading-5"
      />
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
        >
          {busy ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onPick}
          className="hidden"
        />
        {error ? (
          <p className="text-meta text-red-700">{error}</p>
        ) : (
          <p className="text-meta text-ink-2">JPG, PNG, WebP or GIF · up to 5 MB</p>
        )}
      </div>
    </div>
  );
}
