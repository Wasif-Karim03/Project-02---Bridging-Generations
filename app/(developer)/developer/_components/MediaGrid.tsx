"use client";

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
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const total = useMemo(() => groups.reduce((sum, g) => sum + g.images.length, 0), [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        images: g.images.filter(
          (im) => im.name.toLowerCase().includes(q) || g.dir.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.images.length > 0);
  }, [groups, query]);

  async function copy(src: string) {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(src);
      setTimeout(() => setCopied((c) => (c === src ? null : c)), 1500);
    } catch {
      // clipboard unavailable — ignore
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
              <button
                key={im.src}
                type="button"
                onClick={() => copy(im.src)}
                title={`Click to copy: ${im.src}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-hairline bg-ground-2 text-left transition-colors hover:border-accent"
              >
                {/* biome-ignore lint/performance/noImgElement: arbitrary uploaded paths; next/image needs configured domains */}
                <img
                  src={im.src}
                  alt={im.name}
                  className="aspect-square w-full bg-ground-3 object-cover"
                  loading="lazy"
                />
                <span className="truncate px-2 py-1.5 text-[11px] text-ink-2 group-hover:text-ink">
                  {copied === im.src ? "Copied!" : im.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
