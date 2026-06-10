// Resolve the canonical site origin. NEXT_PUBLIC_SITE_URL wins when set to a
// non-empty value; `??` alone isn't enough because an empty-string env var
// (e.g. a blank value on the host) slips through and makes `new URL("")` throw
// at build time. Fall back to the Vercel deployment URL, then the apex domain.
const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelUrl = process.env.VERCEL_URL?.trim();

export const SITE_URL =
  explicitSiteUrl && explicitSiteUrl.length > 0
    ? explicitSiteUrl
    : vercelUrl && vercelUrl.length > 0
      ? `https://${vercelUrl}`
      : "https://bridginggenerations.org";
