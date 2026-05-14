import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt, requiredImageWithAlt } from "../fields";

export const successStoryCollection = collection({
  label: "Success stories",
  path: "content/success-stories/*/",
  slugField: "subjectName",
  format: { contentField: "body" },
  columns: ["publishedAt", "published"],
  schema: {
    subjectName: fields.slug({
      name: {
        label: "Subject name",
        description:
          "First name only for current students. Full name allowed for alums (18+) with written consent.",
        validation: { isRequired: true, length: { min: 1 } },
      },
      slug: { label: "Slug", description: "URL: /success-stories/<slug>" },
    }),
    subjectRole: fields.text({
      label: "Subject role (English)",
      description: 'e.g. "10th Grade, Bandarban".',
    }),
    subjectRoleBn: fields.text({
      label: "Subject role (Bengali)",
      description: "Optional. Falls back to English when empty.",
    }),
    pullQuote: fields.text({
      label: "Pull quote (English)",
      description: "Featured quote on the story card.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    pullQuoteBn: fields.text({
      label: "Pull quote (Bengali)",
      description: "Optional. Falls back to English when empty.",
      multiline: true,
    }),
    body: fields.mdx({
      label: "Body",
      options: {
        image: {
          directory: "public/images/success-stories",
          publicPath: "/images/success-stories/",
        },
      },
    }),
    portrait: requiredImageWithAlt({ label: "Portrait", dir: "success-stories" }),
    portraitMobileFocalPoint: fields.object(
      {
        x: fields.integer({
          label: "X (0–100)",
          description: "Horizontal focal point as a percentage. 50 = center.",
          defaultValue: 50,
          validation: { isRequired: false, min: 0, max: 100 },
        }),
        y: fields.integer({
          label: "Y (0–100)",
          description:
            "Vertical focal point as a percentage. 30 = upper third (good default for portraits).",
          defaultValue: 30,
          validation: { isRequired: false, min: 0, max: 100 },
        }),
      },
      {
        label: "Portrait — mobile focal point",
        description:
          "Drives object-position on the portrait at <640px viewports so the subject stays in frame on phones. Defaults to {x:50, y:30}.",
      },
    ),
    heroDuotone: fields.checkbox({
      label: "Duotone hero",
      description: "Apply a teal/coral duotone blend over the portrait hero.",
      defaultValue: false,
    }),
    dropcap: fields.checkbox({
      label: "Drop cap on first paragraph",
      description: "Magazine-style oversized first letter on the opening paragraph of the body.",
      defaultValue: false,
    }),
    linkedStudentId: fields.relationship({
      label: "Linked student",
      collection: "student",
      description:
        "When set, the consent gate (storyReleaseStatus + consentScope including website) is enforced at build.",
    }),
    published: fields.checkbox({
      label: "Published",
      description: "Draft gate. Off keeps the story out of the public site.",
      defaultValue: false,
    }),
    publishedAt: fields.date({
      label: "Published on",
      validation: { isRequired: true },
    }),
    metaTitle: fields.text({
      label: "Meta title (SEO override)",
      description: "Falls back to subjectName + site title pattern when empty.",
    }),
    metaDescription: fields.text({
      label: "Meta description (SEO override)",
      description: "Falls back to the auto-derived description when empty.",
      multiline: true,
    }),
    ogImageOverride: optionalImageWithAlt({
      label: "OG image override",
      dir: "success-stories",
    }),
  },
});
