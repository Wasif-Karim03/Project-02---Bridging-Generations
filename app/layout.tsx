import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ClerkProviderGate } from "@/components/layout/ClerkProviderGate";
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
    "Bridging Generations sponsors students in the Chittagong Hill Tracts, Bangladesh — keeping kids in the classroom through tuition, books, daily meals, and materials.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale resolved from NEXT_LOCALE cookie (see i18n/request.ts).
  // Bengali script falls back to system fonts if Jakarta doesn't cover the
  // glyph range — that's acceptable for v1.
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <ViewTransitionRoot>
      <html lang={locale} className={`${plusJakartaSans.variable} h-full antialiased`}>
        <head>
          {/* Stripe Checkout is hosted at checkout.stripe.com — preconnect so
              the redirect on submit has DNS/TLS already warmed. */}
          <link rel="preconnect" href="https://checkout.stripe.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://js.stripe.com" />
        </head>
        <body className="flex min-h-full flex-col bg-ground text-body text-ink">
          <ClerkProviderGate>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ClerkProviderGate>
        </body>
      </html>
    </ViewTransitionRoot>
  );
}
