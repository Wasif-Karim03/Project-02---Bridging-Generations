import { describe, expect, it } from "vitest";
import { canShowSuccessStory } from "@/lib/content/canShowPortrait";

const grantedConsent = {
  portraitReleaseStatus: "granted" as const,
  storyReleaseStatus: "granted" as const,
  consentScope: ["website"] as const,
  revokable: true,
  signedDate: "2025-09-01",
  releaseFormId: "BG-REL-2025-001",
  revokedAt: null,
};

const pendingConsent = {
  ...grantedConsent,
  storyReleaseStatus: "pending" as const,
};

const revokedConsent = {
  ...grantedConsent,
  revokedAt: "2026-02-10",
};

const outOfScopeConsent = {
  ...grantedConsent,
  consentScope: ["print-materials"] as const,
};

describe("canShowSuccessStory", () => {
  it("allows an unlinked story to render its portrait", () => {
    expect(canShowSuccessStory({ linkedStudentId: null })).toBe(true);
  });

  it("blocks a linked story when the student is missing from the graph", () => {
    expect(canShowSuccessStory({ linkedStudentId: "x", linkedStudent: null })).toBe(false);
  });

  it("allows a linked story with granted story consent in scope", () => {
    expect(
      canShowSuccessStory({
        linkedStudentId: "x",
        linkedStudent: { consent: grantedConsent },
      }),
    ).toBe(true);
  });

  it("blocks a linked story with pending story consent", () => {
    expect(
      canShowSuccessStory({
        linkedStudentId: "x",
        linkedStudent: { consent: pendingConsent },
      }),
    ).toBe(false);
  });

  it("blocks a linked story when consent was revoked", () => {
    expect(
      canShowSuccessStory({
        linkedStudentId: "x",
        linkedStudent: { consent: revokedConsent },
      }),
    ).toBe(false);
  });

  it("blocks a linked story when website is not in consent scope", () => {
    expect(
      canShowSuccessStory({
        linkedStudentId: "x",
        linkedStudent: { consent: outOfScopeConsent },
      }),
    ).toBe(false);
  });
});
