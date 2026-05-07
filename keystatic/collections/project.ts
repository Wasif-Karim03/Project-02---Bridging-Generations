import { collection, fields } from "@keystatic/core";
import { requiredImageWithAlt } from "../fields";

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Funded", value: "funded" },
  { label: "Paused", value: "paused" },
] as const;

export const projectCollection = collection({
  label: "Projects",
  path: "content/projects/*/",
  slugField: "title",
  columns: ["status", "fundingGoal"],
  schema: {
    title: fields.slug({
      name: { label: "Title", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug", description: "URL: /projects/<slug>" },
    }),
    summary: fields.text({
      label: "Summary",
      description: "1–2 sentences shown on cards.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    body: fields.text({
      label: "Body",
      description: "Full narrative on /projects.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    fundingGoal: fields.integer({
      label: "Funding goal (USD)",
      validation: { isRequired: true, min: 0 },
    }),
    fundingRaised: fields.integer({
      label: "Funding raised (USD)",
      description: "Board updates manually — not auto-synced from Givebutter in v1.",
      validation: { isRequired: true, min: 0 },
    }),
    status: fields.select({
      label: "Status",
      options: STATUS_OPTIONS,
      defaultValue: "active",
    }),
    heroImage: requiredImageWithAlt({ label: "Hero image", dir: "projects" }),
    order: fields.integer({
      label: "Sort order",
      description: "Manual sort on /projects; lower = higher in the list.",
    }),
    boardOwnerName: fields.text({
      label: "Board owner",
      description:
        "Optional. Board member who signed onto the outcome. Shown as a typographic byline on the project list item.",
    }),
    lastUpdated: fields.date({
      label: "Last updated",
      description: "Optional. Surfaces a relative-time stamp on the project list item.",
    }),
    mathLineItem: fields.text({
      label: "Line-item math",
      description:
        'Optional. e.g. "$30 = 1 month of meals". Shown as a single typographic line on the project card.',
      multiline: true,
    }),
  },
});
