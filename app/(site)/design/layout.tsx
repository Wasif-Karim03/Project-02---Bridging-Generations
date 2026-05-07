import type { ReactNode } from "react";
import { BreakpointIndicator } from "@/components/dev/BreakpointIndicator";

type Chapter = {
  index: string;
  label: string;
  sections: { id: string; label: string }[];
};

const chapters: Chapter[] = [
  {
    index: "I",
    label: "Foundations",
    sections: [
      { id: "color", label: "Color" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
      { id: "shape", label: "Shape" },
      { id: "shadow", label: "Shadow" },
    ],
  },
  {
    index: "II",
    label: "Primitives",
    sections: [
      { id: "buttons", label: "Buttons" },
      { id: "eyebrow-tagpill", label: "Eyebrow & TagPill" },
      { id: "progressbar", label: "Progress Bar" },
      { id: "avatar-divider", label: "Avatar & Divider" },
    ],
  },
  {
    index: "III",
    label: "Surfaces",
    sections: [
      { id: "forms", label: "Forms" },
      { id: "icons", label: "Icons" },
    ],
  },
  {
    index: "IV",
    label: "System",
    sections: [
      { id: "motion", label: "Motion" },
      { id: "breakpoint", label: "Breakpoint" },
    ],
  },
];

export default function DesignLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-hairline p-8 lg:block">
        <nav aria-label="Design system sections">
          <p className="font-mono text-meta uppercase tracking-[0.2em] text-ink-2">Contents</p>
          <ol className="mt-6 space-y-6">
            {chapters.map((chapter) => (
              <li key={chapter.label}>
                <p className="flex items-baseline gap-2 font-mono text-meta uppercase text-ink">
                  <span className="text-ink-2">{chapter.index}</span>
                  <span>{chapter.label}</span>
                </p>
                <ul className="mt-2 space-y-1.5 text-body-sm">
                  {chapter.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        className="text-ink-2 transition hover:text-accent"
                        href={`#${section.id}`}
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-8 lg:p-12">{children}</div>
      <BreakpointIndicator />
    </div>
  );
}
