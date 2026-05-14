import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

// Six team groups per spec — board, moderator, R&D, accounting, coordinator, mentor.
// "Mentor" entries also feed the /mentors showcase page; the same collection
// powers both /about and /mentors with a team filter.
export const TEAM_OPTIONS = [
  { label: "Board Member", value: "board" },
  { label: "Moderator", value: "moderator" },
  { label: "Research & Development", value: "rnd" },
  { label: "Accounting", value: "accounting" },
  { label: "Coordinator", value: "coordinator" },
  { label: "Mentor", value: "mentor" },
] as const;

export type TeamGroup = (typeof TEAM_OPTIONS)[number]["value"];

export const boardMemberCollection = collection({
  label: "Team members",
  path: "content/board/*/",
  slugField: "name",
  columns: ["role", "team", "order"],
  schema: {
    name: fields.slug({
      name: { label: "Name", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug" },
    }),
    team: fields.select({
      label: "Team",
      description:
        "Which group on /about (or /mentors). Determines which section the person appears under.",
      options: TEAM_OPTIONS,
      defaultValue: "board",
    }),
    role: fields.text({
      label: "Role / Position",
      description: 'e.g. "Founder & President", "Communicator", "Resources consultant".',
      validation: { isRequired: true, length: { min: 1 } },
    }),
    occupation: fields.text({
      label: "Occupation / Status",
      description: 'e.g. "Professor, HK University", "Student", "Canada Resident".',
    }),
    country: fields.text({
      label: "Country",
      description: "Used by Board section (USA / Hong Kong / Canada / Sri Lanka / etc.).",
    }),
    educationStatus: fields.text({
      label: "Education status",
      description:
        'e.g. "College", "Rangunia Gov College", "CTG Gov University". Used by Moderators / R&D / Accounting / Coordinator / Mentor sections.',
    }),
    bio: fields.text({
      label: "Bio / Statement",
      description:
        '1–3 sentences. "About you and your thoughts of BG" for the board; "Why do you do this?" / "Why do you like it?" for other groups.',
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    portrait: optionalImageWithAlt({ label: "Portrait", dir: "board" }),
    startDate: fields.date({
      label: "Start date",
      description: "When this person joined the org / began this role. Optional.",
    }),
    endDate: fields.date({
      label: "End date",
      description: "Leave empty if currently active. Filled if the term has ended.",
    }),
    order: fields.integer({
      label: "Sort order",
      description: "Manual sort within the team group; lower = higher in the list.",
    }),
  },
});
