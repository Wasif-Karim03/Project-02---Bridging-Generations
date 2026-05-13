import { describe, expect, it } from "vitest";
import { canShowPortrait, canShowStory, type StudentConsent } from "@/lib/content/canShowPortrait";

const granted: StudentConsent = {
  portraitReleaseStatus: "granted",
  storyReleaseStatus: "granted",
  consentScope: ["website"],
  revokable: true,
  signedDate: "2026-01-01",
  releaseFormId: "FORM-001",
};

describe("canShowPortrait", () => {
  it("returns false when consent is missing", () => {
    expect(canShowPortrait(undefined)).toBe(false);
  });

  it("returns false when portraitReleaseStatus is not granted", () => {
    expect(canShowPortrait({ ...granted, portraitReleaseStatus: "pending" })).toBe(false);
    expect(canShowPortrait({ ...granted, portraitReleaseStatus: "denied" })).toBe(false);
    expect(canShowPortrait({ ...granted, portraitReleaseStatus: "revoked" })).toBe(false);
  });

  it("returns false when website is not in consent scope", () => {
    expect(canShowPortrait({ ...granted, consentScope: ["print-materials"] })).toBe(false);
    expect(canShowPortrait({ ...granted, consentScope: [] })).toBe(false);
  });

  it("returns false when revokedAt is set, regardless of other fields", () => {
    expect(canShowPortrait({ ...granted, revokedAt: "2026-03-01" })).toBe(false);
  });

  it("returns true when granted, in-scope, and not revoked", () => {
    expect(canShowPortrait(granted)).toBe(true);
  });
});

describe("canShowStory", () => {
  it("gates on storyReleaseStatus not portraitReleaseStatus", () => {
    expect(canShowStory({ ...granted, storyReleaseStatus: "pending" })).toBe(false);
    expect(
      canShowStory({
        ...granted,
        portraitReleaseStatus: "pending",
        storyReleaseStatus: "granted",
      }),
    ).toBe(true);
  });
});
