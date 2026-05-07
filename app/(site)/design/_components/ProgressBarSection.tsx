import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionShell } from "./SectionShell";

export function ProgressBarSection() {
  return (
    <SectionShell
      id="progressbar"
      number="§8"
      label="Progress Bar"
      meta={[
        { key: "a11y", value: "role=progressbar" },
        { key: "track", value: "sharp" },
        { key: "tip", value: "pill" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Teal fill on hairline track with a coral tip indicator. Funded state swaps the label and
        drops the tip.
      </p>
      <div className="mt-10 max-w-xl space-y-8">
        <ProgressBar percentage={0} label="Raised $0 of $10,000" />
        <ProgressBar percentage={35} label="Raised $3,500 of $10,000" />
        <ProgressBar percentage={72} label="Raised $7,200 of $10,000" />
        <ProgressBar percentage={100} tone="funded" />
      </div>
    </SectionShell>
  );
}
