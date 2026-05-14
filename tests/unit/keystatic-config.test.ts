import { describe, expect, it } from "vitest";
import keystaticConfig from "@/keystatic.config";

const EXPECTED_COLLECTIONS = [
  "school",
  "student",
  "project",
  "activity",
  "blogPost",
  "successStory",
  "testimonial",
  "galleryImage",
  "boardMember",
  "donorProfile",
  "teacher",
] as const;

const EXPECTED_SINGLETONS = [
  "siteSettings",
  "statsSnapshot",
  "donorsPage",
  "donatePage",
  "donationJourney",
  "contactPage",
  "termsPage",
  "studentsPage",
  "projectsPage",
  "scholarshipsPage",
] as const;

describe("keystatic config", () => {
  it("registers every CMS-managed collection", () => {
    const keys = Object.keys(keystaticConfig.collections ?? {}).sort();
    expect(keys).toEqual([...EXPECTED_COLLECTIONS].sort());
  });

  it("registers every Keystatic-managed singleton (nav + footer are fixture-driven)", () => {
    const keys = Object.keys(keystaticConfig.singletons ?? {}).sort();
    expect(keys).toEqual([...EXPECTED_SINGLETONS].sort());
  });

  it("each singleton writes to content/<kebab-key>/index.<ext> via trailing-slash path", () => {
    const singletons = keystaticConfig.singletons ?? {};
    for (const [_, def] of Object.entries(singletons)) {
      expect(def.path).toMatch(/^content\/[a-z-]+\/$/);
    }
  });

  it("storage mode is local when KEYSTATIC_GITHUB_CLIENT_ID is unset", () => {
    // Tests always run without the OAuth secret, so the config must resolve
    // to local. In production the env var flips it to github storage.
    expect(process.env.KEYSTATIC_GITHUB_CLIENT_ID).toBeFalsy();
    expect(keystaticConfig.storage.kind).toBe("local");
  });

  it("brands the admin with the org name", () => {
    expect(keystaticConfig.ui?.brand?.name).toBe("Bridging Generations");
  });

  it("each collection uses per-entry-directory layout (content/<kebab>/*/)", () => {
    const collections = keystaticConfig.collections ?? {};
    for (const [_, def] of Object.entries(collections)) {
      expect(def.path).toMatch(/^content\/[a-z-]+\/\*\/$/);
    }
  });

  it("blog and success-story bodies use mdx with image directories under public/", () => {
    const blog = keystaticConfig.collections?.blogPost;
    const success = keystaticConfig.collections?.successStory;
    expect(blog?.format).toEqual({ contentField: "body" });
    expect(success?.format).toEqual({ contentField: "body" });
  });
});
