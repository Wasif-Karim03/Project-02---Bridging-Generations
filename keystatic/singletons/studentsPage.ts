import { fields, singleton } from "@keystatic/core";

// Spec: a special headline section for HSC/SSC students needing registration
// fees. Admin can hide the band after registration is complete.
// HSC (Higher Secondary Certificate) = grade 11–12.
// SSC (Secondary School Certificate) = grade 10.
export const studentsPageSingleton = singleton({
  label: "Students page",
  path: "content/students-page/",
  schema: {
    spotlightEnabled: fields.checkbox({
      label: "Show the HSC/SSC spotlight band",
      description:
        "Toggle on while board collects registration-fee sponsorships. Turn off once the cohort is registered.",
      defaultValue: false,
    }),
    spotlightEyebrow: fields.text({
      label: "Spotlight eyebrow",
      description: 'Above the headline (e.g. "Registration spotlight").',
      defaultValue: "Registration spotlight",
    }),
    spotlightHeadline: fields.text({
      label: "Spotlight headline",
      description: 'e.g. "Help these HSC & SSC students cover their exam registration fees".',
      defaultValue: "Help our HSC & SSC students reach the exam hall.",
    }),
    spotlightBody: fields.text({
      label: "Spotlight body",
      description:
        "1–3 sentences explaining what HSC/SSC registration covers and what the gift unlocks.",
      multiline: true,
      defaultValue:
        "Every year a handful of our oldest students sit for the SSC and HSC exams — a fee per student is required before they can register. This is the moment your gift goes the furthest.",
    }),
    spotlightStudents: fields.array(
      fields.relationship({
        label: "Featured student",
        collection: "student",
      }),
      {
        label: "Featured students",
        description:
          "Optional curated list. Leave empty to auto-show all current grade-10/11/12 students.",
        itemLabel: (props) => props.value ?? "Student",
      },
    ),
    rulesIntro: fields.text({
      label: "Scholarship rules — intro",
      description: "Short lead-in above the rules block on /students. (Task 17)",
      multiline: true,
      defaultValue:
        "Sponsored students must keep these terms to remain eligible. Anyone may apply; the board reviews every application.",
    }),
    rulesBody: fields.mdx({
      label: "Scholarship rules — body",
      description:
        "Full rules and regulations. Markdown supported. Editors update here whenever the policy changes.",
      options: {
        image: {
          directory: "public/images/students-page",
          publicPath: "/images/students-page/",
        },
      },
    }),
  },
});
