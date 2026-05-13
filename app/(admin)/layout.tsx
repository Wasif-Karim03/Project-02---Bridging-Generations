import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keystatic — Bridging Generations",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Admin overrides the global bg-ground with a clean white surface and
  // unwinds the body's flex column so Keystatic's UI fills the viewport.
  return <div className="-mt-0 min-h-screen bg-white text-ink">{children}</div>;
}
