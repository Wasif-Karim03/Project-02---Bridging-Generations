import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

export const schoolCollection = collection({
  label: "Schools",
  path: "content/schools/*/",
  slugField: "name",
  columns: ["location"],
  schema: {
    name: fields.slug({
      name: { label: "Name", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug", description: "URL-safe ID. Stable — never change after publish." },
    }),
    location: fields.text({
      label: "Location",
      description: 'e.g. "Thanchi, Bandarban"',
      validation: { isRequired: true, length: { min: 1 } },
    }),
    description: fields.text({
      label: "Description (English)",
      description: "1–2 sentences for /about or /students section headers",
      multiline: true,
    }),
    descriptionBn: fields.text({
      label: "Description (Bengali)",
      description: "Optional. Falls back to English when empty.",
      multiline: true,
    }),
    establishedYear: fields.integer({
      label: "Established year",
      validation: { min: 1800, max: 2100 },
    }),
    heroImage: optionalImageWithAlt({ label: "Hero image", dir: "schools" }),
    studentCountOverride: fields.integer({
      label: "Student count (override)",
      description:
        "Optional. When unset, the /schools/[slug] page derives the count from the student collection (consent-gated).",
    }),
    overview: fields.mdx({
      label: "Overview",
      description: "Long-form description shown on /schools/[slug]. Markdown supported.",
      options: {
        image: {
          directory: "public/images/schools",
          publicPath: "/images/schools/",
        },
      },
    }),
  },
});
