"use client";

import { useState } from "react";
import { Icon, type IconName } from "./icons";

// A collapsible section card used on the per-page editor. Receives its body as
// server-rendered children (the actual field editors), so only the open/closed
// chrome is client-side.
export function EditorCard({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  icon: IconName;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section
      id={id}
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-hairline bg-ground-2/40 shadow-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-ground-3/40"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon name={icon} className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-[15px]">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-ink-2 text-xs">{description}</span>
          ) : null}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`size-4 shrink-0 text-ink-2 transition-transform ${open ? "" : "-rotate-90"}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? <div className="border-hairline border-t px-5 py-5">{children}</div> : null}
    </section>
  );
}
