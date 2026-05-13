export const AUDIENCE_VALUES = ["donor", "partner", "journalist", "parent", "subscriber"] as const;
export type AudienceValue = (typeof AUDIENCE_VALUES)[number];

/** Audiences that the visible /contact triage shows. `subscriber` is server-only,
 *  set by the /donate/thank-you quarterly-update form via a hidden input. */
export const CONTACT_AUDIENCES: ReadonlyArray<AudienceValue> = [
  "donor",
  "partner",
  "journalist",
  "parent",
];

export const SUBJECT_PREFIX: Record<AudienceValue, string> = {
  donor: "[BG-DONOR]",
  partner: "[BG-PARTNER]",
  journalist: "[BG-PRESS]",
  parent: "[BG-PARENT]",
  subscriber: "[BG-SUBSCRIBE]",
};

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"name" | "email" | "message" | "audience", string>>;
  /** Echoed back on success so the confirmation can show "Sent to: <email>". */
  submittedEmail?: string;
};

export const initialContactState: ContactActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
