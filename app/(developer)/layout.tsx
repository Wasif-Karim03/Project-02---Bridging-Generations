import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site editor — Bridging Generations",
  robots: { index: false, follow: false },
};

// Standalone surface for the password-gated content editor. Like the Keystatic
// admin layout, it overrides the marketing-site chrome with a plain white app
// surface.
export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ground text-ink">{children}</div>;
}
