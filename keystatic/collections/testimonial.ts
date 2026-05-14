import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

const SPEAKER_ROLE_OPTIONS = [
  { label: "Parent", value: "parent" },
  { label: "Teacher", value: "teacher" },
  { label: "Student", value: "student" },
  { label: "Alum", value: "alum" },
  { label: "Board member", value: "board" },
  { label: "Partner", value: "partner" },
  { label: "Volunteer", value: "volunteer" },
  { label: "Donor", value: "donor" },
] as const;

export const testimonialCollection = collection({
  label: "Testimonials",
  path: "content/testimonials/*/",
  slugField: "speakerName",
  columns: ["speakerRole"],
  schema: {
    speakerName: fields.slug({
      name: { label: "Speaker name", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug" },
    }),
    quote: fields.text({
      label: "Quote (English)",
      description: "Up to 280 characters.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1, max: 280 } },
    }),
    quoteBn: fields.text({
      label: "Quote (Bengali)",
      description: "Optional. Falls back to English when empty.",
      multiline: true,
    }),
    speakerTitle: fields.text({
      label: "Speaker title (English)",
      description: 'Free-form full title — e.g. "Principal, Thanchi High School".',
    }),
    speakerTitleBn: fields.text({
      label: "Speaker title (Bengali)",
      description: "Optional. Falls back to English when empty.",
    }),
    highlightWord: fields.text({
      label: "Highlight word",
      description:
        "Optional. One word or short phrase from the quote — receives an amber-highlighter background in the panel.",
      validation: { length: { min: 0, max: 40 } },
    }),
    speakerPhoto: optionalImageWithAlt({ label: "Speaker photo", dir: "testimonials" }),
    speakerRole: fields.select({
      label: "Speaker role",
      description: "Locked enum. Drives card badge and filtering.",
      options: SPEAKER_ROLE_OPTIONS,
      defaultValue: "parent",
    }),
  },
});
