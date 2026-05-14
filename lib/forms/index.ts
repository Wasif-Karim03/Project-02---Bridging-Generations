// Client-safe form types + validators. Server-only helpers (rate limit, email,
// header reading) live in lib/forms/server.ts to keep `next/headers` and the
// resend SDK out of client bundles.

export type FormActionState =
  | { status: "idle"; message: ""; fieldErrors: Record<string, string> }
  | {
      status: "success";
      message: string;
      fieldErrors: Record<string, string>;
      submittedEmail?: string;
    }
  | { status: "error"; message: string; fieldErrors: Record<string, string> };

export const INITIAL_FORM_STATE: FormActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function lengthError(fieldLabel: string, value: string, max: number): string | null {
  if (!value) return null;
  return value.length > max ? `${fieldLabel} must be ${max} characters or less.` : null;
}
