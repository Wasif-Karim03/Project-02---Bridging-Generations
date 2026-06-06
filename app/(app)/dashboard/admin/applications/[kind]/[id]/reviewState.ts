// Shared, non-"use server" module for the review form's action state. Lives
// outside actions.ts because a "use server" file may only export async
// functions — exporting this type + constant from there throws at runtime.

export type ReviewActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_REVIEW_STATE: ReviewActionState = { status: "idle", message: "" };
