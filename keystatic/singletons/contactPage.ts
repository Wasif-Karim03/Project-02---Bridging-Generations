import { fields, singleton } from "@keystatic/core";

export const contactPageSingleton = singleton({
  label: "Contact page",
  path: "content/contact-page/",
  schema: {
    headline: fields.text({
      label: "Headline",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    intro: fields.text({
      label: "Intro",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    destinationEmail: fields.text({
      label: "Destination email",
      description: "Where Resend forwards the contact form.",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    responseNote: fields.text({
      label: "Response note",
      description: 'e.g. "We reply within 2 business days".',
      multiline: true,
    }),
  },
});
