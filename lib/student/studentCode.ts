import "server-only";

// Public student ID shown to students on their dashboard, in confirmation +
// approval emails, and (once Clerk is wired) usable as a sign-in identifier
// alongside email and phone. Derived deterministically from the local
// users.id UUID — no separate column, no possibility of collision at the
// org's scale (8 hex chars = ~4 billion distinct codes).
//
//   uuid "a1b2c3d4-..." → "STU-A1B2C3D4"
//
// Pairs with lib/donor/donorCode.ts (BG-XXXXXXXX) for donor accounts. The
// two helpers are intentionally separate so a future rename of either
// audience stays clean.
export function studentCodeForUuid(uuid: string): string {
  const first8 = uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `STU-${first8}`;
}
