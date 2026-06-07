"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type MediaImage = { src: string; dir: string; name: string };
type Group = { dir: string; images: MediaImage[] };

const DIR_LABELS: Record<string, string> = {
  site: "Page hero images",
  students: "Students",
  board: "Team & mentors",
  teachers: "Teachers",
  projects: "Projects",
  activities: "Activities",
  blog: "Blog",
  "success-stories": "Success stories",
  testimonials: "Testimonials",
  gallery: "Gallery",
  schools: "Schools",
};

export function MediaGrid({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const visibleGroups = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, images: g.images.filter((im) => !removed.has(im.src)) }))
        .filter((g) => g.images.length > 0),
    [groups, removed],
  );

  const total = useMemo(
    () => visibleGroups.reduce((sum, g) => sum + g.images.length, 0),
    [visibleGroups],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleGroups;
    return visibleGroups
      .map((g) => ({
        ...g,
        images: g.images.filter(
          (im) => im.name.toLowerCase().includes(q) || g.dir.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.images.length > 0);
  }, [visibleGroups, query]);

  async function copy(src: string) {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(src);
      setTimeout(() => setCopied((c) => (c === src ? null : c)), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  async function remove(src: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This removes the file from the website.`)) return;
    setDeleting(src);
    try {
      const res = await fetch("/api/developer/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src }),
      });
      if (res.ok) {
        setRemoved((prev) => new Set(prev).add(src));
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        window.alert(data.error ?? "Delete failed.");
      }
    } catch {
      window.alert("Network error. Try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (total === 0) {
    return (
      <p className="rounded-xl border border-hairline border-dashed bg-ground-2 px-4 py-10 text-center text-ink-2 text-sm">
        No images uploaded yet. Photos you upload while editing a page show up here.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search images by name or folder…"
        className="w-full rounded-lg border border-hairline bg-ground-2 px-4 py-2.5 text-sm outline-none focus:border-accent"
      />

      {filtered.map((g) => (
        <section key={g.dir}>
          <h2 className="font-medium text-ink-2 text-xs uppercase tracking-wide">
            {DIR_LABELS[g.dir] ?? g.dir} <span className="text-ink-2/70">· {g.images.length}</span>
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.images.map((im) => (
              <div
                key={im.src}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-hairline bg-ground-2 transition-colors hover:border-accent"
              >
                <button
                  type="button"
                  onClick={() => copy(im.src)}
                  title={`Click to copy: ${im.src}`}
                  className="block text-left"
                >
                  {/* biome-ignore lint/performance/noImgElement: arbitrary uploaded paths; next/image needs configured domains */}
                  <img
                    src={im.src}
                    alt={im.name}
                    className="aspect-square w-full bg-ground-3 object-cover"
                    loading="lazy"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => remove(im.src, im.name)}
                  disabled={deleting === im.src}
                  title="Delete image"
                  className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-ground/80 text-ink-2 opacity-0 backdrop-blur transition hover:bg-accent-2/15 hover:text-accent-2-text focus:opacity-100 group-hover:opacity-100 disabled:opacity-100"
                >
                  {deleting === im.src ? (
                    <span className="text-[10px]">…</span>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                      <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => copy(im.src)}
                  className="truncate px-2 py-1.5 text-left text-[11px] text-ink-2 group-hover:text-ink"
                >
                  {copied === im.src ? "Copied!" : im.name}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
