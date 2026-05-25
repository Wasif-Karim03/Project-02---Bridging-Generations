#!/usr/bin/env node
/**
 * Bootstrap the first admin account. Looks up a user by email and flips
 * their role to "admin". The user must already have signed up via Clerk so
 * a row exists in the users table.
 *
 * Why this exists: there is no in-app path to grant admin — once an admin
 * exists, they can promote others via /dashboard/admin/users, but the
 * very first admin has to be set manually. Tracked in ENGINEERING-AUDIT.md.
 *
 * Usage:
 *   DATABASE_URL='postgres://…' node scripts/grant-admin.mjs you@example.com
 *
 * Pull DATABASE_URL from Netlify with:
 *   netlify env:get DATABASE_URL
 *
 * Safety: idempotent. Refuses to run without DATABASE_URL, errors clearly if
 * the email doesn't match a user row, no-ops if the user is already admin.
 */
import postgres from "postgres";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-admin.mjs <email>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  console.error("Pull it with: netlify env:get DATABASE_URL");
  console.error("Then prefix this command: DATABASE_URL='…' node scripts/grant-admin.mjs <email>");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });
try {
  const before = await sql`
    SELECT id, email, role FROM users WHERE email = ${email} LIMIT 1
  `;
  if (before.length === 0) {
    console.error(`No user found with email "${email}".`);
    console.error("They must sign up at /sign-up first so the Clerk webhook seeds a users row.");
    process.exit(2);
  }
  const user = before[0];
  if (user.role === "admin") {
    console.log(`${email} is already admin (id=${user.id}). No-op.`);
    process.exit(0);
  }
  await sql`
    UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = ${user.id}
  `;
  console.log(`Promoted ${email} from ${user.role} to admin (id=${user.id}).`);
} catch (err) {
  console.error("Update failed:", err.message ?? err);
  process.exit(3);
} finally {
  await sql.end({ timeout: 5 });
}
