import { fields, singleton } from "@keystatic/core";

export const donorsPageSingleton = singleton({
  label: "Donors page",
  path: "content/donors-page/",
  schema: {
    headline: fields.text({
      label: "Headline",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    subhead: fields.text({
      label: "Subhead",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    thankYouMessages: fields.array(
      fields.object({
        message: fields.text({
          label: "Message",
          description: "Anonymous thank-you. No names. No amounts.",
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
        }),
        year: fields.integer({
          label: "Year",
          validation: { min: 2000, max: 2100 },
        }),
        tier: fields.select({
          label: "Tier",
          description:
            "Optional. When any message has a tier, the wall groups by tier (Founder / Patron / Friend). When no message has a tier, the wall falls back to chronological-by-year groupings.",
          options: [
            { label: "(no tier)", value: "" },
            { label: "Founder", value: "founder" },
            { label: "Patron", value: "patron" },
            { label: "Friend", value: "friend" },
          ],
          defaultValue: "",
        }),
      }),
      {
        label: "Thank-you wall",
        description:
          "Anonymous thank-yous shown as a wall. Anything typed here becomes public — assume no PII.",
        itemLabel: (props) => props.fields.message.value.slice(0, 60) || "Message",
      },
    ),
    totalDonorsLabel: fields.text({
      label: "Total donors label",
      description: 'e.g. "110 donors and counting".',
      validation: { isRequired: true, length: { min: 1 } },
    }),
  },
});
