#!/usr/bin/env node
/**
 * Wipe every user-generated row from the database — and optionally the
 * matching Clerk accounts — so the app can be re-tested from a clean slate.
 *
 * Dry-run is the default. Without --confirm the script only prints what
 * WOULD be deleted, leaving everything intact. This is the only safe way
 * to point this at the production DB.
 *
 * Tables cleared (in FK-safe order):
 *   weekly_reports
 *   mentor_student_assignments
 *   donations
 *   scholarship_applications
 *   mentor_applications
 *   student_registrations
 *   mentors
 *   donor_profiles
 *   users
 *
 * Tables left alone: rate_limits (anti-abuse buckets; harmless to keep).
 *
 * Clerk: if CLERK_SECRET_KEY is set in env, every Clerk user whose
 * clerk_user_id appears in our users table is DELETEd via Clerk Admin
 * API before the DB rows go. Skip Clerk by unsetting that env var.
 *
 * Usage:
 *   # Dry-run (default — counts only, no writes)
 *   DATABASE_URL='postgres://…' node scripts/reset-test-data.mjs
 *
 *   # Actually wipe
 *   DATABASE_URL='postgres://…' CLERK_SECRET_KEY='sk_test_…' \
 *     node scripts/reset-test-data.mjs --confirm
 *
 *   # Wipe DB but leave Clerk users alone
 *   DATABASE_URL='postgres://…' node scripts/reset-test-data.mjs --confirm
 */
import postgres from "postgres";

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set.");
  console.error("Pull it with: netlify env:get DATABASE_URL");
  process.exit(1);
}

const clerkKey = process.env.CLERK_SECRET_KEY ?? null;

const TABLES_IN_DELETE_ORDER = [
  "weekly_reports",
  "mentor_student_assignments",
  "donations",
  "scholarship_applications",
  "mentor_applications",
  "student_registrations",
  "mentors",
  "donor_profiles",
  "users",
];

const sql = postgres(dbUrl, { max: 1, prepare: false });
try {
  console.log(`Mode: ${confirm ? "EXECUTE" : "DRY-RUN (pass --confirm to actually delete)"}`);
  console.log(`Clerk deletion: ${clerkKey ? "enabled" : "skipped (no CLERK_SECRET_KEY)"}`);
  console.log("");

  // 1. Count what's there
  const counts = {};
  for (const table of TABLES_IN_DELETE_ORDER) {
    const rows = await sql.unsafe(`SELECT COUNT(*)::int AS c FROM ${table}`);
    counts[table] = rows[0].c;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log("Current row counts:");
  for (const table of TABLES_IN_DELETE_ORDER) {
    console.log(`  ${table.padEnd(32)} ${counts[table]}`);
  }
  console.log(`  ${"─".repeat(40)}`);
  console.log(`  ${"TOTAL".padEnd(32)} ${total}`);
  console.log("");

  if (total === 0) {
    console.log("Database is already empty. Nothing to do.");
    process.exit(0);
  }

  // 2. Collect Clerk user IDs while we still can
  const clerkUserIds = (
    await sql`SELECT clerk_user_id, email FROM users WHERE clerk_user_id IS NOT NULL`
  ).map((r) => ({ clerkUserId: r.clerk_user_id, email: r.email }));
  console.log(`Clerk users to delete: ${clerkUserIds.length}`);
  for (const u of clerkUserIds) {
    console.log(`  ${u.clerkUserId}  ${u.email}`);
  }
  console.log("");

  if (!confirm) {
    console.log("Dry-run complete. Re-run with --confirm to actually delete.");
    process.exit(0);
  }

  // 3. Delete Clerk users (if key provided). Bail if any individual delete
  //    fails — we'd rather stop mid-wipe than leave DB pointing at Clerk
  //    accounts that no longer exist (or vice-versa).
  if (clerkKey) {
    console.log("Deleting Clerk users…");
    let deleted = 0;
    let skipped = 0;
    for (const { clerkUserId, email } of clerkUserIds) {
      const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${clerkKey}` },
      });
      if (res.ok) {
        deleted++;
        console.log(`  deleted ${clerkUserId} (${email})`);
      } else if (res.status === 404) {
        skipped++;
        console.log(`  skipped ${clerkUserId} — already gone`);
      } else {
        const body = await res.text();
        console.error(`Clerk delete failed for ${clerkUserId} (HTTP ${res.status}): ${body}`);
        process.exit(4);
      }
    }
    console.log(`Clerk: ${deleted} deleted, ${skipped} already-gone`);
    console.log("");
  }

  // 4. Delete DB rows in FK-safe order
  console.log("Deleting DB rows…");
  for (const table of TABLES_IN_DELETE_ORDER) {
    const before = counts[table];
    if (before === 0) {
      console.log(`  ${table.padEnd(32)} (already empty)`);
      continue;
    }
    await sql.unsafe(`DELETE FROM ${table}`);
    console.log(`  ${table.padEnd(32)} ${before} deleted`);
  }
  console.log("");
  console.log("Done. Database is empty.");
} catch (err) {
  console.error("Reset failed:", err.message ?? err);
  process.exit(3);
} finally {
  await sql.end({ timeout: 5 });
}
