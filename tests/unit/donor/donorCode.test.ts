import { describe, expect, it } from "vitest";
import { donorCodeForUuid } from "@/lib/donor/donorCode";

describe("donorCodeForUuid", () => {
  it("prefixes the first 8 hex chars with BG- and uppercases", () => {
    expect(donorCodeForUuid("a1b2c3d4-1234-5678-9abc-def012345678")).toBe("BG-A1B2C3D4");
  });

  it("is stable for the same UUID across calls", () => {
    const u = "00000000-aaaa-bbbb-cccc-111122223333";
    expect(donorCodeForUuid(u)).toBe(donorCodeForUuid(u));
  });

  it("ignores dashes and only uses hex characters", () => {
    // The leading zeros are still characters that count toward the slice.
    expect(donorCodeForUuid("00000001-2222-3333-4444-555566667777")).toBe("BG-00000001");
  });
});
