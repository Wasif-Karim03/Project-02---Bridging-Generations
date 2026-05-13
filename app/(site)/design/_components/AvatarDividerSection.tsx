import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Divider";
import { SectionShell } from "./SectionShell";

export function AvatarDividerSection() {
  return (
    <SectionShell
      id="avatar-divider"
      number="§9"
      label="Avatar · Divider"
      meta={[
        { key: "avatar", value: "pill · sm md lg" },
        { key: "divider", value: "1px hairline" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Avatar renders a portrait when a src is provided, otherwise a warm-cream initials tile.
        Three sizes. Divider is a 1px hairline rule with optional spacing.
      </p>
      <div className="mt-10 border-t border-hairline pt-6">
        <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
          Avatar · initials fallback
        </p>
        <div className="mt-4 flex items-end gap-10">
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Amina Begum" size="sm" />
            <span className="font-mono text-meta uppercase text-ink-2">sm · 32px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Rahim Chowdhury" size="md" />
            <span className="font-mono text-meta uppercase text-ink-2">md · 48px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Ishita" size="lg" />
            <span className="font-mono text-meta uppercase text-ink-2">lg · 80px</span>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-hairline pt-6">
        <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
          Divider · spacings
        </p>
        <div className="mt-4">
          <p className="text-body-sm text-ink-2">Above (spacing="sm")</p>
          <Divider spacing="sm" />
          <p className="text-body-sm text-ink-2">Between (spacing="md")</p>
          <Divider spacing="md" />
          <p className="text-body-sm text-ink-2">Under (spacing="lg")</p>
          <Divider spacing="lg" />
          <p className="text-body-sm text-ink-2">End.</p>
        </div>
      </div>
    </SectionShell>
  );
}
