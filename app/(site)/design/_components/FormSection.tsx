import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { SectionShell } from "./SectionShell";

export function FormSection() {
  return (
    <SectionShell
      id="forms"
      number="§10"
      label="Forms"
      meta={[
        { key: "primitives", value: "4" },
        { key: "errors", value: "aria-live polite" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Field composes label + primitive + hint or error. Error region uses{" "}
        <code className="font-mono">role="alert"</code> and{" "}
        <code className="font-mono">aria-live="polite"</code>; helper copy uses the safer
        accent-2-text.
      </p>
      <div className="mt-10 grid max-w-xl gap-6">
        <Field label="Name">{(props) => <Input {...props} placeholder="Your name" />}</Field>
        <Field label="Email" hint="We'll only use this to reply.">
          {(props) => <Input {...props} type="email" placeholder="you@example.com" />}
        </Field>
        <Field label="Subject" error="Subject is required.">
          {(props) => <Input {...props} required />}
        </Field>
        <Field label="Topic">
          {(props) => (
            <Select {...props} defaultValue="general">
              <option value="general">General</option>
              <option value="sponsorship">Sponsorship</option>
              <option value="press">Press</option>
            </Select>
          )}
        </Field>
        <Field label="Message" hint="Up to 1000 characters.">
          {(props) => <Textarea {...props} rows={5} placeholder="Tell us more…" />}
        </Field>
      </div>
    </SectionShell>
  );
}
