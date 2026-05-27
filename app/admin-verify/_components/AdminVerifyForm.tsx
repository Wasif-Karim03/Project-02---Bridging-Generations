"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { sendAdminVerifyCodeAction, submitAdminVerifyCodeAction } from "../actions";

type Props = {
  emailHint: string;
};

export function AdminVerifyForm({ emailHint }: Props) {
  const [sendState, sendAction, sending] = useActionState(sendAdminVerifyCodeAction, null);
  const [verifyState, verifyAction, verifying] = useActionState(submitAdminVerifyCodeAction, null);

  const sendError = sendState && sendState.ok === false ? sendState.error : null;
  const verifyError = verifyState && verifyState.ok === false ? verifyState.error : null;
  const codeSent = sendState?.ok === true;

  return (
    <div className="flex flex-col gap-6">
      <form action={sendAction}>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-[44px] items-center border border-hairline px-5 text-nav-link uppercase text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : codeSent ? "Resend code" : "Send code to my email"}
        </button>
      </form>

      {sendError ? (
        <p
          role="alert"
          aria-live="polite"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
        >
          {sendError}
        </p>
      ) : null}
      {codeSent ? (
        <p
          role="status"
          className="border border-accent bg-accent/5 px-4 py-3 text-body-sm text-accent"
        >
          Code sent to <span className="font-mono">{emailHint}</span>. Expires in 10 minutes.
        </p>
      ) : null}

      <form action={verifyAction} className="flex flex-col gap-4">
        <Field label="6-digit code" hint="From the email we just sent.">
          {(p) => (
            <Input
              {...p}
              name="code"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="font-mono text-heading-5 tracking-[0.4em]"
            />
          )}
        </Field>
        {verifyError ? (
          <p
            role="alert"
            aria-live="polite"
            className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
          >
            {verifyError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={verifying}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying ? "Verifying…" : "Verify + continue"}
        </button>
      </form>
    </div>
  );
}
