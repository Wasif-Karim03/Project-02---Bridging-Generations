import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Site editor — Bridging Generations",
  robots: { index: false, follow: false },
};

// Standalone surface for the password-gated content editor. Overrides the
// marketing-site chrome with a calm app surface + a persistent top bar so the
// editor always shows where you are and offers a one-click way back home / to
// the live site.
export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground text-ink">
      <header className="sticky top-0 z-40 border-b border-hairline bg-ground-2/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/developer" className="flex flex-col leading-tight">
            <span className="font-semibold text-ink">Bridging Generations</span>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-2">Site editor</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta uppercase tracking-[0.06em] text-accent transition-colors hover:text-accent-2-text"
          >
            View live site ↗
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
