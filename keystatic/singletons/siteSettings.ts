import { fields, singleton } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

export const siteSettingsSingleton = singleton({
  label: "Site settings",
  path: "content/site-settings/",
  schema: {
    orgName: fields.text({
      label: "Organization name",
      defaultValue: "Bridging Generations",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    missionShort: fields.text({
      label: "Mission (1-sentence)",
      description: "Used in the footer and meta descriptions.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    missionFull: fields.text({
      label: "Mission (full paragraph)",
      description: "Used on /about.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    visionFull: fields.text({
      label: "Vision (full paragraph)",
      description: "Used on /about.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    foundingYear: fields.integer({
      label: "Founding year",
      validation: { isRequired: true, min: 1900, max: 2100 },
    }),
    ein: fields.text({
      label: "EIN (501(c)(3))",
      description: "Rendered in the footer and the /about Transparency block.",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    form990Url: fields.url({
      label: "Form 990 URL",
      description: "Link to the most recent IRS Form 990 (or Candid). May be empty pre-filing.",
    }),
    candidProfileUrl: fields.url({
      label: "Candid / GuideStar profile URL",
      description: "Signals legitimacy to grant reviewers.",
    }),
    mailingAddress: fields.text({
      label: "Mailing address",
      description:
        "Plain string — single or multi-line. Required under most U.S. state fundraising-registration rules.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    contactEmail: fields.text({
      label: "Contact email",
      description: "Routes to Resend.",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    socialLinks: fields.object(
      {
        instagram: fields.url({ label: "Instagram URL" }),
        facebook: fields.url({ label: "Facebook URL" }),
        linkedin: fields.url({ label: "LinkedIn URL" }),
        youtube: fields.url({ label: "YouTube URL" }),
      },
      { label: "Social links" },
    ),
    metaDefaults: fields.object(
      {
        title: fields.text({
          label: "Default page title",
          validation: { isRequired: true, length: { min: 1 } },
        }),
        description: fields.text({
          label: "Default meta description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
        }),
        ogImage: optionalImageWithAlt({ label: "Default OG image", dir: "site" }),
        twitterHandle: fields.text({
          label: "Twitter / X handle",
          description: 'Without the @ — e.g. "BridgingGen".',
        }),
      },
      { label: "Meta defaults" },
    ),
    copy: fields.object(
      {
        navDonateCta: fields.text({
          label: "Nav donate CTA",
          description: 'e.g. "Donate".',
          validation: { isRequired: true, length: { min: 1 } },
        }),
        footerTagline: fields.text({
          label: "Footer tagline",
          description: "Short tagline under the wordmark in the footer.",
          validation: { isRequired: true, length: { min: 1 } },
        }),
        donateButtonPrimary: fields.text({
          label: "Donate button — primary",
          description: 'e.g. "Sponsor a student".',
          validation: { isRequired: true, length: { min: 1 } },
        }),
        donateButtonSecondary: fields.text({
          label: "Donate button — secondary",
          description: 'e.g. "Donate once".',
          validation: { isRequired: true, length: { min: 1 } },
        }),
        contactFormSuccess: fields.text({
          label: "Contact form — success message",
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
        }),
        contactFormError: fields.text({
          label: "Contact form — error message",
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
        }),
        newsletterOptIn: fields.text({
          label: "Newsletter opt-in label",
          description: "Reserved for a future newsletter checkbox; safe to leave generic.",
          validation: { isRequired: true, length: { min: 1 } },
        }),
        placeholderAlt: fields.text({
          label: "Student placeholder — alt text",
          description: "Used on student cards that render the neutral illustrated placeholder.",
          validation: { isRequired: true, length: { min: 1 } },
        }),
      },
      { label: "Shared microcopy" },
    ),
  },
});
