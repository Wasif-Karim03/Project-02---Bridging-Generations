import { fields, singleton } from "@keystatic/core";

// /projects/scholarships sub-page singleton.
// Covers overview, eligibility, application steps, and the "what we cover"
// breakdown so editors can update without code.
export const scholarshipsPageSingleton = singleton({
  label: "Scholarships page",
  path: "content/scholarships-page/",
  schema: {
    heroEyebrow: fields.text({
      label: "Hero eyebrow",
      defaultValue: "Sub-program",
    }),
    heroHeadline: fields.text({
      label: "Hero headline",
      defaultValue: "Scholarships.",
    }),
    heroSubhead: fields.text({
      label: "Hero subhead",
      multiline: true,
      defaultValue:
        "Tuition, books, daily meals, and the materials that keep underprivileged students in the classroom from first standard to higher secondary.",
    }),
    overview: fields.mdx({
      label: "Overview body",
      description: "Markdown supported. Describe the scholarship program in detail.",
      options: {
        image: {
          directory: "public/images/scholarships-page",
          publicPath: "/images/scholarships-page/",
        },
      },
    }),
    eligibility: fields.mdx({
      label: "Eligibility body",
      description: "Markdown supported. Who can apply, criteria, evidence required.",
      options: {
        image: {
          directory: "public/images/scholarships-page",
          publicPath: "/images/scholarships-page/",
        },
      },
    }),
    applyCtaLabel: fields.text({
      label: "Apply CTA label",
      defaultValue: "Apply for a scholarship",
    }),
    applyCtaHref: fields.text({
      label: "Apply CTA href",
      description:
        "Until the online form lands, point at /contact?audience=sponsor or an external Google Form URL.",
      defaultValue: "/contact",
    }),
  },
});
