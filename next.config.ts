import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// Allowlist covers Givebutter embed (Phase 8). Analytics deferred.
// Resend is server-side only and does not require CSP entries.
//
// connect-src is intentionally narrow today — Givebutter widget fetches must be
// captured from a real /donate network trace once accountId/campaignId stop being
// [CONFIRM:] stubs. R3.2 added widgets.givebutter.com (the script host); api.* /
// stripe.* / analytics endpoints will be appended once verifiable in the browser.
//
// 'unsafe-eval' is dev-only — Next.js HMR relies on dynamic code generation for
// module replacement. Prod builds don't, so prod CSP omits it.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://givebutter.com https://widgets.givebutter.com"
  : "script-src 'self' 'unsafe-inline' https://givebutter.com https://widgets.givebutter.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://widgets.givebutter.com",
  "frame-src 'self' https://givebutter.com https://widgets.givebutter.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://givebutter.com",
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
  async redirects() {
    return [
      {
        source: "/donation-journey",
        destination: "/donors",
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

export default analyze(nextConfig);
