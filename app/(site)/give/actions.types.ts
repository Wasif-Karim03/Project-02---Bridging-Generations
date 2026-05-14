export type GiveActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"name" | "address" | "email" | "phone" | "country", string>>;
};

export const initialGiveState: GiveActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
