import { fields, singleton } from "@keystatic/core";

const MILESTONE_TAG_OPTIONS = [
  { label: "Milestone", value: "milestone" },
  { label: "Fundraiser", value: "fundraiser" },
  { label: "Scholarship", value: "scholarship" },
  { label: "Distribution", value: "distribution" },
  { label: "Visit", value: "visit" },
  { label: "Announcement", value: "announcement" },
] as const;

export const donationJourneySingleton = singleton({
  label: "Donation Journey",
  path: "content/donation-journey/",
  schema: {
    headline: fields.text({
      label: "Headline",
      description: 'e.g. "Five years. 156 students."',
      validation: { isRequired: true, length: { min: 1 } },
    }),
    intro: fields.text({
      label: "Intro",
      description: "1–2 sentence page intro shown in the hero.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    totalRaisedAllTime: fields.integer({
      label: "Total raised all time (USD)",
      description: "Shown as the hero stat. Update manually each year.",
      validation: { isRequired: true, min: 0 },
    }),
    totalDonorsAllTime: fields.integer({
      label: "Total donors all time",
      description: "Lifetime donor count for the lifetime stats block.",
      validation: { isRequired: true, min: 0 },
    }),
    totalStudentsAllTime: fields.integer({
      label: "Total students supported all time",
      description: "Cumulative count across all years.",
      validation: { isRequired: true, min: 0 },
    }),
    yearlyEntries: fields.array(
      fields.object({
        year: fields.integer({
          label: "Year",
          validation: { isRequired: true, min: 2021, max: 2030 },
        }),
        totalRaised: fields.integer({
          label: "Total raised that year (USD)",
          validation: { isRequired: true, min: 0 },
        }),
        studentCount: fields.integer({
          label: "Student count (end of year)",
          validation: { isRequired: true, min: 0 },
        }),
        donorCount: fields.integer({
          label: "Donor count that year",
          validation: { isRequired: true, min: 0 },
        }),
        milestone: fields.text({
          label: "Key milestone",
          description: "1–2 sentences describing the year's most important outcome.",
          multiline: true,
          validation: { isRequired: true, length: { min: 1 } },
        }),
        milestoneTag: fields.select({
          label: "Milestone tag",
          options: MILESTONE_TAG_OPTIONS,
          defaultValue: "milestone",
        }),
        highlightQuote: fields.text({
          label: "Highlight quote (optional)",
          description: "A short quote from a donor, student, or board member.",
          multiline: true,
        }),
        quoteAttribution: fields.text({
          label: "Quote attribution (optional)",
          description: 'e.g. "Anonymous donor, 2023" or "Priya, scholarship recipient".',
        }),
      }),
      {
        label: "Yearly entries",
        description: "One entry per year, oldest first.",
        itemLabel: (props) =>
          props.fields.year.value ? String(props.fields.year.value) : "Year entry",
      },
    ),
  },
});
