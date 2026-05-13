import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusDot } from "@/components/ui/StatusDot";
import { TagPill } from "@/components/ui/TagPill";
import { SectionShell } from "./SectionShell";

export function EyebrowTagPillSection() {
  return (
    <SectionShell
      id="eyebrow-tagpill"
      number="§7"
      label="Eyebrow · TagPill · StatusDot"
      meta={[
        { key: "primitives", value: "3" },
        { key: "shape", value: "pill · functional" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Three small primitives. Eyebrow sits above headings in accent teal; TagPill tags content in
        default (muted cream) or live (elevated cream with a StatusDot).
      </p>
      <div className="mt-10 space-y-10">
        <div className="border-t border-hairline pt-6 first:border-t-0 first:pt-0">
          <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">Eyebrow</p>
          <div className="mt-4">
            <Eyebrow>Programs</Eyebrow>
            <p className="mt-1 text-heading-3">Our programs</p>
          </div>
        </div>
        <div className="border-t border-hairline pt-6">
          <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">TagPill</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TagPill>Sponsored</TagPill>
            <TagPill>Community</TagPill>
            <TagPill variant="live">Live update</TagPill>
            <TagPill variant="live" statusVariant="pending">
              Waiting list
            </TagPill>
            <TagPill variant="stamp">Distribution</TagPill>
          </div>
        </div>
        <div className="border-t border-hairline pt-6">
          <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">StatusDot</p>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <StatusDot variant="active" label="Active" />
              <span className="text-body-sm text-ink-2">Active (coral)</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot variant="pending" label="Pending" />
              <span className="text-body-sm text-ink-2">Pending (outlined)</span>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
