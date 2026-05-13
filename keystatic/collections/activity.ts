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
      name: { label: "Title", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug" },
    }),
    excerpt: fields.text({
      label: "Excerpt",
      description: "Up to 240 characters — shown on cards.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1, max: 240 } },
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
  },
});
