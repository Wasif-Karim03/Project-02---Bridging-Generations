#!/usr/bin/env node
/**
 * Wipe every user-generated row from the database — and optionally the
 * matching Clerk accounts — so the app can be re-tested from a clean slate.
 *
 * Preserves the bootstrap admin: any user (and matching Clerk identity)
 * whose email matches BOOTSTRAP_ADMIN_EMAIL is kept. All other rows that
 * reference that admin (e.g. mentor_applications they reviewed) survive
 * because the FK columns are nullable + already null'd at delete.
 *
 * Dry-run is the default. Without --confirm the script only prints what
 * WOULD be deleted, leaving everything intact. This is the only safe way
 * to point this at the production DB.
 *
 * Tables cleared (in FK-safe order — see TABLES_IN_DELETE_ORDER below).
 *
 * Tables left alone: rate_limits (anti-abuse buckets; harmless to keep).
 *
 * Clerk: if CLERK_SECRET_KEY is set in env, every Clerk user whose
 * clerk_user_id appears in our users table is DELETEd via Clerk Admin
 * API before the DB rows go — except the bootstrap admin. Skip Clerk by
 * unsetting that env var.
 *
 * Usage:
 *   # Dry-run (default — counts only, no writes)
 *   DATABASE_URL='postgres://…' BOOTSTRAP_ADMIN_EMAIL='admin@example' \
 *     node scripts/reset-test-data.mjs
 *
 *   # Actually wipe
 *   DATABASE_URL='postgres://…' CLERK_SECRET_KEY='sk_test_…' \
 *     BOOTSTRAP_ADMIN_EMAIL='admin@example' \
 *     node scripts/reset-test-data.mjs --confirm
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
const bootstrapEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? "").trim().toLowerCase();
if (!bootstrapEmail) {
  console.warn(
    "WARNING: BOOTSTRAP_ADMIN_EMAIL is not set — every user (including any admin) will be deleted.",
  );
}

// Order matters: child rows that reference users.id (or other tables) get
// deleted before the rows they point to. mentor_calls → mentors,
// media_items → media_folders → media_profiles, etc.
const TABLES_IN_DELETE_ORDER = [
  "mentor_calls",
  "weekly_reports",
  "mentor_student_assignments",
  "manual_donation_entries",
  "donations",
  "scholarship_applications",
  "mentor_applications",
  "student_registrations",
  "mentors",
  "donor_profiles",
  "accountant_profiles",
  "media_items",
  "media_folders",
  "media_profiles",
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

  // 2. Collect Clerk user IDs while we still can — split into "to delete"
  //    vs "preserved" (bootstrap admin).
  const allUsers = await sql`
    SELECT clerk_user_id, email
    FROM users
    WHERE clerk_user_id IS NOT NULL
  `;
  const preserved = allUsers.filter(
    (r) => bootstrapEmail && (r.email ?? "").toLowerCase() === bootstrapEmail,
  );
  const toDelete = allUsers.filter(
    (r) => !bootstrapEmail || (r.email ?? "").toLowerCase() !== bootstrapEmail,
  );
  console.log(`Preserved (bootstrap admin): ${preserved.length}`);
  for (const u of preserved) {
    console.log(`  KEEP ${u.clerk_user_id}  ${u.email}`);
  }
  console.log(`Clerk users to delete: ${toDelete.length}`);
  for (const u of toDelete) {
    console.log(`  ${u.clerk_user_id}  ${u.email}`);
  }
  console.log("");

  if (total === 0 && preserved.length === allUsers.length) {
    console.log("Nothing to delete — bootstrap admin only, no other rows.");
    process.exit(0);
  }

  if (!confirm) {
    console.log("Dry-run complete. Re-run with --confirm to actually delete.");
    process.exit(0);
  }

  // 3. Delete Clerk users (if key provided). Skip the bootstrap admin.
  if (clerkKey) {
    console.log("Deleting Clerk users…");
    let deleted = 0;
    let skipped = 0;
    for (const { clerk_user_id: clerkUserId, email } of toDelete) {
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
    console.log(`Clerk: ${deleted} deleted, ${skipped} already-gone, ${preserved.length} preserved`);
    console.log("");
  }

  // 4. Delete DB rows. For tables other than `users`, wipe everything —
  //    cascading FKs to the preserved admin survive because every reference
  //    column is nullable (set null on delete) or is set on a row we're
  //    deleting anyway. For `users`, keep the bootstrap admin.
  console.log("Deleting DB rows…");
  for (const table of TABLES_IN_DELETE_ORDER) {
    const before = counts[table];
    if (before === 0) {
      console.log(`  ${table.padEnd(32)} (already empty)`);
      continue;
    }
    if (table === "users" && bootstrapEmail) {
      const result = await sql`
        DELETE FROM users
        WHERE LOWER(email) <> ${bootstrapEmail}
      `;
      console.log(`  ${table.padEnd(32)} ${result.count} deleted, ${preserved.length} kept`);
    } else {
      await sql.unsafe(`DELETE FROM ${table}`);
      console.log(`  ${table.padEnd(32)} ${before} deleted`);
    }
  }
  console.log("");
  console.log(
    `Done. ${preserved.length > 0 ? `Bootstrap admin (${preserved[0].email}) preserved.` : "Database is empty."}`,
  );
} catch (err) {
  console.error("Reset failed:", err.message ?? err);
  process.exit(3);
} finally {
  await sql.end({ timeout: 5 });
}
