import "server-only";

// The public donor code shown to donors on their dashboard, receipts, and the
// admin queue. Derived deterministically from the local users.id UUID so it
// never needs its own column and never changes for a given donor.
//
//   uuid "a1b2c3d4-..." → "BG-A1B2C3D4"
//
// 8 hex chars = ~4 billion distinct codes — far past anything this org needs.
export function donorCodeForUuid(uuid: string): string {
  const first8 = uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `BG-${first8}`;
}
