import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

// Next.js 16 proxy (formerly "middleware"). Two responsibilities:
//
//   1. Set noindex headers on /design preview routes — always on.
//   2. When Clerk is configured, run clerkMiddleware() so the auth() and
//      currentUser() helpers work inside server components.
//
// We gate Clerk on NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Without that env var
// @clerk/nextjs/server throws on its first call, which would 500 the entire
// marketing site during the staging window between "deploy" and "wire up
// Clerk keys." Falling back to a plain pass-through keeps the public pages
// reachable while auth-gated routes either render their "Setup pending"
// fallback (sign-in pages) or redirect to it (dashboards).

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function designNoIndex(request: NextRequest): NextResponse | undefined {
  if (request.nextUrl.pathname.startsWith("/design")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  return undefined;
}

// Cached per-worker so we don't import Clerk on every request.
type Delegate = (req: NextRequest, ev: NextFetchEvent) => Promise<NextResponse> | NextResponse;
let delegate: Delegate | null = null;

async function getDelegate(): Promise<Delegate> {
  if (delegate) return delegate;
  if (clerkConfigured) {
    const { clerkMiddleware } = await import("@clerk/nextjs/server");
    delegate = clerkMiddleware((_auth, req) => designNoIndex(req)) as Delegate;
  } else {
    delegate = (req) => designNoIndex(req) ?? NextResponse.next();
  }
  return delegate;
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const handler = await getDelegate();
  return handler(request, event);
}

export const config = {
  matcher: [
    // Run on every route except Next internals + obvious static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // And always on API + trpc routes.
    "/(api|trpc)(.*)",
  ],
};
