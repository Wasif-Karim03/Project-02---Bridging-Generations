import { Link } from "next-view-transitions";
import { AdminIcon, type AdminIconName } from "./icons";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="flex flex-col gap-2">
      <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">{eyebrow}</p>
      <h1 className="text-balance text-heading-2 text-ink">{title}</h1>
      {description ? <p className="max-w-[60ch] text-body text-ink-2">{description}</p> : null}
    </header>
  );
}

type Cta = { href: string; label: string; external?: boolean };

// Friendly "this section is being built" placeholder. Each admin section that
// isn't wired up yet renders one of these so the sidebar navigates somewhere
// real and the owner can see exactly what's coming and where to edit it today.
export function SectionScaffold({
  icon,
  eyebrow,
  title,
  description,
  comingSoon,
  ctas = [],
}: {
  icon: AdminIconName;
  eyebrow: string;
  title: string;
  description: string;
  comingSoon: string[];
  ctas?: Cta[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="rounded-2xl border-2 border-dashed border-hairline bg-ground-2 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <AdminIcon name={icon} className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-heading-5 text-ink">This panel is coming next</p>
            <p className="max-w-[48ch] text-body-sm text-ink-2">
              We'll build the full {title.toLowerCase()} controls right here. For now, here's what
              this section will let you do.
            </p>
          </div>

          <ul className="grid w-full max-w-[44ch] gap-2 text-left">
            {comingSoon.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-body-sm text-ink-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                {item}
              </li>
            ))}
          </ul>

          {ctas.length > 0 ? (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              {ctas.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  target={cta.external ? "_blank" : undefined}
                  rel={cta.external ? "noopener noreferrer" : undefined}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-accent bg-accent px-4 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
                >
                  {cta.label}
                  {cta.external ? <span aria-hidden="true">↗</span> : null}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
