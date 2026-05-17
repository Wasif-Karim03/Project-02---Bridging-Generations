import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Reads locale from NEXT_LOCALE cookie via i18n/request.ts.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// CSP — Stripe Checkout takes the user to a Stripe-hosted page (no iframe
// needed), so we only need form-action + connect-src for the Stripe.js
// confirmation network call. Resend is server-side only and needs no entry.
//
// 'unsafe-eval' is dev-only — Next.js HMR relies on dynamic code generation
// for module replacement. Prod builds don't, so prod CSP omits it.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
  : "script-src 'self' 'unsafe-inline' https://js.stripe.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://m.stripe.com https://m.stripe.network",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["motion"],
  // Keystatic reads YAML/MDX from content/ at runtime via Node's fs. The
  // standalone build tracer (`@vercel/nft`) doesn't see those files as
  // imports, so without an explicit include they're missing from the
  // Netlify Lambda bundle and the reader hangs forever on the first
  // fs.open. Including them for every route is the safest pattern — the
  // total payload is small (YAML + MDX, not images) and we want every
  // server route to be able to read any Keystatic singleton.
  outputFileTracingIncludes: {
    "/**/*": ["./content/**/*"],
  },
  async redirects() {
    return [
      {
        source: "/donation-journey",
        destination: "/donors",
        permanent: true,
      },
      {
        source: "/donate-us",
        destination: "/donate",
        permanent: true,
      },
      {
        source: "/donate-us/:path*",
        destination: "/donate/:path*",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/mission-vission",
        destination: "/mission-vision",
        permanent: true,
      },
      {
        source: "/testimonial",
        destination: "/testimonials",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "1",
  openAnalyzer: false,
});

export default withNextIntl(analyze(nextConfig));
