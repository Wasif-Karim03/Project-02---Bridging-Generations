import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Next.js 16 proxy (formerly "middleware"). We wrap Clerk's middleware
// because Clerk's auth() / currentUser() helpers throw inside server
// components if clerkMiddleware() isn't running. The callback is the
// existing /design noindex header logic, preserved verbatim.
//
// clerkMiddleware passes through by default — no auto-protection. Each
// page handles its own gating with requireRole() / requireUserId() from
// lib/auth, so adding pages never requires touching this file.

export const proxy = clerkMiddleware((_auth, request) => {
  if (request.nextUrl.pathname.startsWith("/design")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
});

export const config = {
  matcher: [
    // Run on every route except Next internals + obvious static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // And always on API + trpc routes.
    "/(api|trpc)(.*)",
  ],
};
