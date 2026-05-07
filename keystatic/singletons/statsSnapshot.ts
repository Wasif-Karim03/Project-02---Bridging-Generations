import { fields, singleton } from "@keystatic/core";

export const statsSnapshotSingleton = singleton({
  label: "Stats snapshot",
  path: "content/stats-snapshot/",
  schema: {
    studentCount: fields.integer({
      label: "Student count",
      description: "The big number on the home page.",
      validation: { isRequired: true, min: 0 },
    }),
    schoolCount: fields.integer({
      label: "School count",
      validation: { isRequired: true, min: 0 },
    }),
    donorCount: fields.integer({
      label: "Donor count",
      description: "Used on /donors and home stats trio.",
      validation: { isRequired: true, min: 0 },
    }),
    homeHeroEyebrow: fields.text({
      label: "Home hero eyebrow",
      description: 'e.g. "The Chittagong Hill Tracts".',
      validation: { isRequired: true, length: { min: 1 } },
    }),
    homeHeroHeadline: fields.text({
      label: "Home hero headline",
      description: "Multi-line — line breaks render as separate visual lines.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    homeHeroSubhead: fields.text({
      label: "Home hero subhead",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
  },
});
