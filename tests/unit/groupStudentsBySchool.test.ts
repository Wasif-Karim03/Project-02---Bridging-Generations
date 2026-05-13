import { describe, expect, it } from "vitest";
import { groupStudentsBySchool, type Student } from "@/lib/content/students";

const baseConsent = {
  portraitReleaseStatus: "granted" as const,
  storyReleaseStatus: "granted" as const,
  consentScope: ["website"] as const,
  revokable: true,
  signedDate: "2025-09-01",
  releaseFormId: "BG-REL-2025-001",
  revokedAt: null,
};

function make(id: string, schoolId: string, grade: number, displayName: string): Student {
  return {
    id,
    displayName,
    schoolId,
    grade,
    community: "marma",
    quote: "",
    bio: "",
    portrait: { src: null, alt: "" },
    consent: baseConsent,
    sponsorshipStatus: "sponsored",
    enrolledAt: null,
  };
}

describe("groupStudentsBySchool", () => {
  it("groups students by schoolId alphabetically by schoolId", () => {
    const groups = groupStudentsBySchool([
      make("a", "rangamati-school", 6, "Rima"),
      make("b", "bandarban-school", 4, "Bishal"),
      make("c", "bandarban-school", 2, "Anika"),
    ]);
    expect(groups.map((g) => g.schoolId)).toEqual(["bandarban-school", "rangamati-school"]);
  });

  it("sorts students within a school by grade ascending then displayName", () => {
    const groups = groupStudentsBySchool([
      make("a", "school-a", 8, "Zoe"),
      make("b", "school-a", 4, "Bishal"),
      make("c", "school-a", 4, "Anika"),
      make("d", "school-a", 10, "Jyoti"),
    ]);
    expect(groups[0].students.map((s) => s.displayName)).toEqual([
      "Anika",
      "Bishal",
      "Zoe",
      "Jyoti",
    ]);
  });

  it("drops students with empty schoolId", () => {
    const groups = groupStudentsBySchool([
      make("a", "", 4, "Orphan"),
      make("b", "school-a", 4, "Bishal"),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].schoolId).toBe("school-a");
  });

  it("returns an empty array when given no students", () => {
    expect(groupStudentsBySchool([])).toEqual([]);
  });
});
