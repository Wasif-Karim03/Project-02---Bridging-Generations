import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ViewTransitionRoot } from "@/components/layout/ViewTransitionRoot";
import { SITE_URL } from "@/lib/seo/siteUrl";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bridging Generations",
    template: "%s — Bridging Generations",
  },
  description:
    "Bridging Generations sponsors 156 students in the Chittagong Hill Tracts, Bangladesh — keeping kids in the classroom through tuition, books, daily meals, and materials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitionRoot>
      <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
        <head>
          <link rel="preconnect" href="https://widgets.givebutter.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://givebutter.com" />
        </head>
        <body className="flex min-h-full flex-col bg-ground text-body text-ink">{children}</body>
      </html>
    </ViewTransitionRoot>
  );
}
