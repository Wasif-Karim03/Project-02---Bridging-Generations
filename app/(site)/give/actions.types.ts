export type GiveActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"name" | "email" | "photoUrl" | "message", string>>;
};

export const initialGiveState: GiveActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
