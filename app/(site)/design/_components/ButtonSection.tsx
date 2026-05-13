import { Button } from "@/components/ui/Button";
import { SectionShell } from "./SectionShell";

const variants: Array<{ variant: "primary" | "secondary" | "tertiary"; label: string }> = [
  { variant: "primary", label: "Donate now" },
  { variant: "secondary", label: "Learn more" },
  { variant: "tertiary", label: "See all programs" },
];

export function ButtonSection() {
  return (
    <SectionShell
      id="buttons"
      number="§6"
      label="Buttons"
      meta={[
        { key: "variants", value: "3" },
        { key: "states", value: "default · disabled · loading · link" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Three variants, sharp corners, coral shadow on primary. Focus uses the global accent ring.
        Reduced-motion drops the hover scale.
      </p>
      <div className="mt-10 space-y-10">
        {variants.map(({ variant, label }) => (
          <div key={variant} className="border-t border-hairline pt-6 first:border-t-0 first:pt-0">
            <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">{variant}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button variant={variant}>{label}</Button>
              <Button variant={variant} disabled>
                {label}
              </Button>
              <Button variant={variant} loading>
                {label}
              </Button>
              <Button variant={variant} href="/design#buttons">
                {label} (link)
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
