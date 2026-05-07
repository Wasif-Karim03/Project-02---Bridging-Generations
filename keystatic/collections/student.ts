import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

const COMMUNITY_OPTIONS = [
  { label: "Unknown / leave blank", value: "unknown" },
  { label: "Chakma", value: "chakma" },
  { label: "Marma", value: "marma" },
  { label: "Tripura", value: "tripura" },
  { label: "Tanchangya", value: "tanchangya" },
  { label: "Mro", value: "mro" },
  { label: "Bawm", value: "bawm" },
  { label: "Khumi", value: "khumi" },
  { label: "Khiyang", value: "khiyang" },
  { label: "Lushai", value: "lushai" },
  { label: "Pankho", value: "pankho" },
  { label: "Bengali", value: "bengali" },
  { label: "Other", value: "other" },
] as const;

const RELEASE_STATUS_OPTIONS = [
  { label: "Pending — no consent recorded", value: "pending" },
  { label: "Granted — written release on file", value: "granted" },
  { label: "Denied — family declined", value: "denied" },
  { label: "Revoked — consent withdrawn", value: "revoked" },
] as const;

const CONSENT_SCOPE_OPTIONS = [
  { label: "Website (this site)", value: "website" },
  { label: "Print materials", value: "print-materials" },
  { label: "Social media", value: "social-media" },
  { label: "Grant reports", value: "grant-reports" },
  { label: "Press", value: "press" },
] as const;

const SPONSORSHIP_OPTIONS = [
  { label: "Sponsored", value: "sponsored" },
  { label: "Waiting for a sponsor", value: "waiting" },
] as const;

export const studentCollection = collection({
  label: "Students",
  path: "content/students/*/",
  slugField: "displayName",
  columns: ["grade", "sponsorshipStatus"],
  schema: {
    displayName: fields.slug({
      name: {
        label: "Display name (first name only)",
        description: "First name only. Full names are not published for child-safety reasons.",
        validation: { isRequired: true, length: { min: 1 } },
      },
      slug: {
        label: "Internal slug",
        description: "Stable internal ID — e.g. bg-0042. Never rendered publicly.",
      },
    }),
    schoolId: fields.relationship({
      label: "School",
      collection: "school",
      validation: { isRequired: true },
    }),
    grade: fields.integer({
      label: "Grade",
      validation: { isRequired: true, min: 1, max: 12 },
    }),
    community: fields.select({
      label: "Community",
      description: "Leave as Unknown when not confirmed — never guess.",
      options: COMMUNITY_OPTIONS,
      defaultValue: "unknown",
    }),
    quote: fields.text({
      label: "Aspiration quote",
      description: 'One-line aspiration shown on the card (e.g. "I want to become a teacher").',
    }),
    bio: fields.text({
      label: "Bio (profile page only)",
      description:
        "Optional. A short prose bio shown on /students/<slug>. Gated by storyReleaseStatus + Website scope. Leave blank when no consent is on file.",
      multiline: true,
    }),
    portrait: optionalImageWithAlt({ label: "Portrait", dir: "students" }),
    consent: fields.object(
      {
        portraitReleaseStatus: fields.select({
          label: "Portrait release status",
          description: "Only Granted unlocks the portrait on the public site.",
          options: RELEASE_STATUS_OPTIONS,
          defaultValue: "pending",
        }),
        storyReleaseStatus: fields.select({
          label: "Story release status",
          description: "Gates whether this student may appear in a successStory record.",
          options: RELEASE_STATUS_OPTIONS,
          defaultValue: "pending",
        }),
        signedDate: fields.date({
          label: "Date the family signed the release",
          description: "Required when any release status is Granted.",
        }),
        releaseFormId: fields.text({
          label: "Release form ID",
          description: "Reference to the signed physical/digital form on file.",
        }),
        consentScope: fields.multiselect({
          label: "Consent scope",
          description: "Website renders only when 'Website' is in scope.",
          options: CONSENT_SCOPE_OPTIONS,
        }),
        revokable: fields.checkbox({
          label: "Revokable",
          description: "Always true — revocation is policy-guaranteed. Do not change.",
          defaultValue: true,
        }),
        revokedAt: fields.date({
          label: "Revoked on",
          description: "Set when the family withdraws consent. Removes portrait on next deploy.",
        }),
      },
      { label: "Consent" },
    ),
    sponsorshipStatus: fields.select({
      label: "Sponsorship status",
      options: SPONSORSHIP_OPTIONS,
      defaultValue: "waiting",
    }),
    enrolledAt: fields.date({ label: "Enrolled on" }),
  },
});
