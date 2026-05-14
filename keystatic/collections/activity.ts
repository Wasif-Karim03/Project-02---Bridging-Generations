import { collection, fields } from "@keystatic/core";
import { requiredImageWithAlt } from "../fields";

const TAG_OPTIONS = [
  { label: "Distribution", value: "distribution" },
  { label: "Milestone", value: "milestone" },
  { label: "Visit", value: "visit" },
  { label: "Announcement", value: "announcement" },
  { label: "Event", value: "event" },
  { label: "Fundraiser", value: "fundraiser" },
] as const;

export const activityCollection = collection({
  label: "Activities",
  path: "content/activities/*/",
  slugField: "title",
  columns: ["tag", "publishedAt"],
  schema: {
    title: fields.slug({
      name: { label: "Title (English)", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug" },
    }),
    titleBn: fields.text({
      label: "Title (Bengali)",
      description: "Optional. Shown when locale is Bengali.",
    }),
    excerpt: fields.text({
      label: "Excerpt (English)",
      description: "Up to 240 characters — shown on cards.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1, max: 240 } },
    }),
    excerptBn: fields.text({
      label: "Excerpt (Bengali)",
      description: "Optional. Falls back to English when empty.",
      multiline: true,
    }),
    tag: fields.select({
      label: "Tag",
      description: "Locked enum. Adding more requires a content-model PR.",
      options: TAG_OPTIONS,
      defaultValue: "milestone",
    }),
    published: fields.checkbox({
      label: "Published",
      description: "Draft gate. Off keeps the activity out of the public site.",
      defaultValue: false,
    }),
    publishedAt: fields.date({
      label: "Published on",
      validation: { isRequired: true },
    }),
    coverImage: requiredImageWithAlt({ label: "Cover image", dir: "activities" }),
    relatedProjectId: fields.relationship({
      label: "Related project",
      collection: "project",
    }),
    pdfUrl: fields.url({
      label: "Report PDF URL",
      description:
        "Optional. When set, the homepage activity entry shows a 'Download report (PDF)' link.",
    }),
  },
});
