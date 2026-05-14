import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

// Teacher panel shown on /projects (spec: "subsection for the teachers that
// will showcase the teacher panel, including their information, Name (photo
// box), date started teaching, their education status. Teaching which school,
// major.").
export const teacherCollection = collection({
  label: "Teachers",
  path: "content/teachers/*/",
  slugField: "name",
  columns: ["schoolId", "startedTeaching"],
  schema: {
    name: fields.slug({
      name: { label: "Name", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug" },
    }),
    portrait: optionalImageWithAlt({ label: "Photo", dir: "teachers" }),
    schoolId: fields.relationship({
      label: "School",
      collection: "school",
    }),
    educationStatus: fields.text({
      label: "Education status",
      description: 'e.g. "B.Ed., Rangamati Government College".',
    }),
    major: fields.text({
      label: "Subject / Major",
      description: 'What this teacher teaches (e.g. "Mathematics", "English").',
    }),
    startedTeaching: fields.date({
      label: "Started teaching",
      description: "When this teacher began teaching at the partner school.",
    }),
    bio: fields.text({
      label: "Short note",
      description: "Optional. 1–2 sentences about the teacher.",
      multiline: true,
    }),
    order: fields.integer({
      label: "Sort order",
      description: "Manual sort within the teacher panel; lower = higher.",
    }),
  },
});
