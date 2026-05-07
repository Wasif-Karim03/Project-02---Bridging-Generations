import { collection, fields } from "@keystatic/core";

const DESIGNATION_OPTIONS = [
  { label: "Tuition", value: "tuition" },
  { label: "Books & learning materials", value: "books" },
  { label: "Daily meals", value: "meals" },
  { label: "School supplies", value: "materials" },
  { label: "General (where most needed)", value: "general" },
] as const;

export const donorProfileCollection = collection({
  label: "Donor Profiles",
  path: "content/donor-profiles/*/",
  slugField: "displayName",
  columns: ["isAnonymous", "joinedDate"],
  schema: {
    displayName: fields.slug({
      name: {
        label: "Display name",
        description:
          "The public name shown on the profile page. Use a first name, alias, or 'Anonymous'. Never a full legal name.",
        validation: { isRequired: true, length: { min: 1 } },
      },
      slug: {
        label: "Internal slug",
        description: "URL: /donors/<slug>. Auto-generated; stable — do not change after creation.",
      },
    }),
    email: fields.text({
      label: "Email (internal — never rendered publicly)",
      description:
        "For admin records and correspondence only. Not shown on the public profile page.",
      validation: { isRequired: true, length: { min: 1 } },
    }),
    isAnonymous: fields.checkbox({
      label: "Anonymous profile",
      description:
        "When checked, /donors/<slug> returns 404. The donor exists in the system but has no public page.",
      defaultValue: false,
    }),
    photoUrl: fields.url({
      label: "Photo URL (optional)",
      description:
        "Link to a hosted photo (e.g. LinkedIn profile picture URL). Leave empty to show initials avatar.",
    }),
    joinedDate: fields.date({
      label: "Joined on",
      description: "Date the donor first gave. Shown on the public profile.",
    }),
    message: fields.text({
      label: "Public message (optional)",
      description:
        "A short message the donor wrote when creating their profile. Shown publicly. Max 300 chars.",
      multiline: true,
    }),
    donationHistory: fields.array(
      fields.object({
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        amount: fields.integer({
          label: "Amount (USD)",
          validation: { isRequired: true, min: 1 },
        }),
        designation: fields.select({
          label: "Designation",
          options: DESIGNATION_OPTIONS,
          defaultValue: "general",
        }),
        linkedStudentId: fields.relationship({
          label: "Linked student (optional)",
          collection: "student",
        }),
        note: fields.text({
          label: "Admin note (internal — not shown publicly)",
          description: "Internal context. Never rendered on the public profile.",
          multiline: true,
        }),
      }),
      {
        label: "Donation history",
        description:
          "Admin-maintained. Each entry becomes a row in the donor's history and a cell in the calendar heat map.",
        itemLabel: (props) => {
          const date = props.fields.date.value ?? "";
          const amount = props.fields.amount.value ?? 0;
          return date ? `${date} — $${amount}` : `$${amount}`;
        },
      },
    ),
  },
});
