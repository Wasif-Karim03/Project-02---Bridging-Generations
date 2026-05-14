import type { Config } from "drizzle-kit";

// drizzle-kit reads this when generating SQL migrations and pushing schema
// changes. Run with:
//   pnpm drizzle-kit generate   # write a new migration to db/migrations/
//   pnpm drizzle-kit push       # apply pending migrations to DATABASE_URL
//
// DATABASE_URL must be set in .env.local (or shell env) when invoking these.
export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost/bridging_generations_dev",
  },
  verbose: true,
  strict: true,
} satisfies Config;
