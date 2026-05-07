import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt } from "../fields";

export const boardMemberCollection = collection({
  label: "Board members",
  path: "content/board/*/",
  slugField: "name",
  columns: ["role", "order"],
  schema: {
    name: fields.slug({
      name: { label: "Name", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug" },
    }),
    role: fields.text({
      label: "Role",
      description: 'e.g. "Founder & President".',
      validation: { isRequired: true, length: { min: 1 } },
    }),
    bio: fields.text({
      label: "Bio",
      description: "1–3 sentences.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1 } },
    }),
    portrait: optionalImageWithAlt({ label: "Portrait", dir: "board" }),
    order: fields.integer({
      label: "Sort order",
      description: "Manual sort on /about; lower = higher in the list.",
    }),
  },
});
