import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazily-initialised Drizzle client. The DATABASE_URL is supplied by Neon
// (auto-injected when the Neon integration is installed in the Vercel project)
// or a manual `.env.local` for dev.
//
// Until Neon is provisioned, callers should defensively check `isDbConfigured()`
// before using `getDb()`. In Phase 4/5 we wire the webhooks + dashboard reads
// to `getDb()`; everything else stays on Keystatic.

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Provision Neon via the Vercel Marketplace or set DATABASE_URL in .env.local.",
    );
  }
  // postgres-js handles the connection pool internally — one client per server
  // instance is fine. `max: 1` avoids exhausting Neon's serverless connection
  // limit on cold starts.
  const sql = postgres(url, { max: 1, prepare: false });
  cached = drizzle(sql, { schema });
  return cached;
}

export { schema };
