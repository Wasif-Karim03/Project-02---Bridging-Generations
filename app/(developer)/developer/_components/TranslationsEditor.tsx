"use client";

import { useMemo, useState } from "react";

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

export function TranslationsEditor({ groups }: { groups: Group[] }) {
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
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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
    } catch {
      setMessage({ kind: "err", text: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <p className="rounded-lg border border-hairline bg-ground-2 px-4 py-3 text-ink-2 text-sm">
        Edit the fixed text on each page in <strong>English</strong> and <strong>বাংলা</strong>. Keep
        any <code className="rounded bg-ground-3 px-1">{"{like_this}"}</code> placeholders exactly
        as they are — they get filled in automatically.
      </p>

      {groups.map((group) => (
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
                        onChange={(e) => setEn((p) => ({ ...p, [item.path]: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-ink-2 text-xs">বাংলা (Bengali)</span>
                      <textarea
                        rows={2}
                        value={bn[item.path] ?? ""}
                        onChange={(e) => setBn((p) => ({ ...p, [item.path]: e.target.value }))}
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

      <div className="sticky bottom-0 flex gap-3 border-hairline border-t bg-ground py-4">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-sm text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
