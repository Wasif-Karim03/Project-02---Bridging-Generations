import { MDXRenderer } from "@/components/content/MDXRenderer";
import { Eyebrow } from "@/components/ui/Eyebrow";

type RulesSectionProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  body?: string;
  tone?: "cream" | "white";
};

// Shared rules & regulations panel used by /students and /projects.
// Renders intro + MDX body in the editorial measure.
export function RulesSection({
  id,
  eyebrow,
  title,
  intro,
  body,
  tone = "cream",
}: RulesSectionProps) {
  if (!intro && !body) return null;
  const bg = tone === "white" ? "bg-ground-2" : "bg-ground";
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={`${bg} scroll-mt-20 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28`}
    >
      <div className="mx-auto max-w-[840px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          {...(id ? { id: `${id}-title` } : {})}
          className="mt-3 text-balance text-heading-1 text-ink"
        >
          {title}
        </h2>
        {intro ? <p className="mt-5 max-w-[60ch] text-body-lg text-ink-2">{intro}</p> : null}
        {body ? (
          <div className="mt-8">
            <MDXRenderer source={body} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
