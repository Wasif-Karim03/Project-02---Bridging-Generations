import { NextResponse } from "next/server";
import { isDbConfigured } from "@/db/client";

// Lightweight health endpoint for uptime monitors + load-balancer checks.
// Returns 200 + a small JSON summary of which integrations are wired so
// the owner can confirm at a glance that env vars made it into the live
// environment. No DB query (would charge compute hours on Neon free tier);
// it just reports whether DATABASE_URL is set.

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "bridging-generations",
      time: new Date().toISOString(),
      integrations: {
        database: isDbConfigured() ? "configured" : "preview",
        clerk: process.env.CLERK_SECRET_KEY ? "configured" : "preview",
        stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "preview",
        resend: process.env.RESEND_API_KEY ? "configured" : "preview",
      },
    },
    {
      status: 200,
      headers: {
        // Health checks must never be cached — every poll needs a live read.
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
