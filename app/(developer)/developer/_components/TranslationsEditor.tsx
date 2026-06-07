"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { path: string; en: string; bn: string };
type Group = { section: string; label: string; items: Item[] };

const inputClass =
  "w-full rounded-lg border border-hairline bg-ground-2 px-3 py-2 text-sm outline-none focus:border-accent";

// Turn the trailing key of a dot-path into a human label: "slide1Headline" →
// "Slide 1 Headline", "aboutUs" → "About Us".
function humanize(pathTail: string): string {
  return pathTail
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export function TranslationsEditor({
  groups,
  compact = false,
}: {
  groups: Group[];
  /** Embedded-in-a-page mode: no intro/search, section headings hidden, inline save. */
  compact?: boolean;
}) {
  const initialEn = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of groups) for (const it of g.items) m[it.path] = it.en;
    return m;
  }, [groups]);
  const initialBn = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of groups) for (const it of g.items) m[it.path] = it.bn;
    return m;
  }, [groups]);

  const [en, setEn] = useState<Record<string, string>>(initialEn);
  const [bn, setBn] = useState<Record<string, string>>(initialBn);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [onlyUntranslated, setOnlyUntranslated] = useState(false);

  // Warn before a tab close / refresh when there are unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const totalCount = useMemo(() => groups.reduce((sum, g) => sum + g.items.length, 0), [groups]);

  // A string counts as "untranslated" when it has English text but no Bangla.
  const untranslatedCount = useMemo(() => {
    let n = 0;
    for (const g of groups) {
      for (const it of g.items) {
        if ((en[it.path] ?? "").trim() && !(bn[it.path] ?? "").trim()) n++;
      }
    }
    return n;
  }, [groups, en, bn]);

  // Filter by key path, the humanized label, or the current English/Bengali
  // text — so the editor can jump straight to the string they want to change.
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !onlyUntranslated) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => {
          if (onlyUntranslated && !((en[it.path] ?? "").trim() && !(bn[it.path] ?? "").trim())) {
            return false;
          }
          if (!q) return true;
          const tail = it.path.split(".").slice(1).join(".");
          const hay = [
            it.path,
            humanize(tail.split(".").pop() ?? tail),
            en[it.path] ?? "",
            bn[it.path] ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, en, bn, onlyUntranslated]);
  const filteredCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.items.length, 0),
    [filteredGroups],
  );

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/developer/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ en, bn }),
      });
      const data = (await res.json()) as { error?: string; mode?: string };
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Save failed." });
        return;
      }
      setMessage({
        kind: "ok",
        text:
          data.mode === "github"
            ? "Saved. The live site will update in about a minute."
            : "Saved to your local project files.",
      });
      setDirty(false);
    } catch {
      setMessage({ kind: "err", text: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "space-y-6" : "space-y-10"}>
      {compact ? null : (
        <p className="rounded-lg border border-hairline bg-ground-2 px-4 py-3 text-ink-2 text-sm">
          Edit the fixed text on each page in <strong>English</strong> and <strong>বাংলা</strong>.
          Keep any <code className="rounded bg-ground-3 px-1">{"{like_this}"}</code> placeholders
          exactly as they are — they get filled in automatically.
        </p>
      )}

      {compact ? null : (
        <div className="sticky top-14 z-30 -mx-1 bg-ground/95 px-1 py-2 backdrop-blur">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by text or key (e.g. “Be a Donor”, nav, slide1)…"
            className="w-full rounded-lg border border-hairline bg-ground-2 px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-ink-2 text-xs">
              {query.trim()
                ? `${filteredCount} of ${totalCount} matching`
                : `${totalCount} text fields`}
            </p>
            <label className="flex items-center gap-1.5 text-ink-2 text-xs">
              <input
                type="checkbox"
                checked={onlyUntranslated}
                onChange={(e) => setOnlyUntranslated(e.target.checked)}
              />
              Show only untranslated
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  untranslatedCount > 0
                    ? "bg-accent-2/15 text-accent-2-text"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {untranslatedCount === 0 ? "all done ✓" : `${untranslatedCount} missing Bangla`}
              </span>
            </label>
          </div>
        </div>
      )}

      {filteredGroups.length === 0 ? (
        <p className="rounded-xl border border-hairline border-dashed bg-ground-2 px-4 py-10 text-center text-ink-2 text-sm">
          No text matches “{query}”.
        </p>
      ) : null}

      {filteredGroups.map((group) => (
        <section key={group.section}>
          <h2 className="font-medium text-ink-2 text-xs uppercase tracking-wide">{group.label}</h2>
          <div className="mt-3 space-y-5">
            {group.items.map((item) => {
              const tail = item.path.split(".").slice(1).join(".");
              return (
                <div key={item.path}>
                  <div className="mb-1.5">
                    <span className="font-medium text-sm">
                      {humanize(tail.split(".").pop() ?? tail)}
                    </span>
                    <span className="ml-2 font-mono text-ink-2 text-xs">{item.path}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-ink-2 text-xs">English</span>
                      <textarea
                        rows={2}
                        value={en[item.path] ?? ""}
                        onChange={(e) => {
                          setEn((p) => ({ ...p, [item.path]: e.target.value }));
                          setDirty(true);
                        }}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-ink-2 text-xs">বাংলা (Bengali)</span>
                      <textarea
                        rows={2}
                        value={bn[item.path] ?? ""}
                        onChange={(e) => {
                          setBn((p) => ({ ...p, [item.path]: e.target.value }));
                          setDirty(true);
                        }}
                        className={inputClass}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {message ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.kind === "ok" ? "bg-accent/10 text-accent" : "bg-accent-2/10 text-accent-2-text"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div
        className={
          compact
            ? "flex gap-3"
            : "sticky bottom-0 flex gap-3 border-hairline border-t bg-ground py-4"
        }
      >
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-sm text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : compact ? "Save text" : "Save changes"}
        </button>
        {dirty && !busy ? (
          <span className="self-center text-accent-2-text text-xs">● Unsaved changes</span>
        ) : null}
      </div>
    </div>
  );
}
