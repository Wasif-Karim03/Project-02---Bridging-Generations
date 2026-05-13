import { Fragment, type ReactNode } from "react";

type MetaPair = { key: string; value: string };

type Props = {
  id: string;
  number: string;
  label: string;
  meta?: MetaPair[];
  children: ReactNode;
};

export function SectionShell({ id, number, label, meta, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24 pt-16 first:pt-8">
      <div className="border-t border-hairline pt-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="flex items-baseline gap-4 text-heading-4 uppercase tracking-[0.04em]">
            <span className="text-accent">{number}</span>
            <span className="text-ink">{label}</span>
          </h3>
          {meta && meta.length > 0 && (
            <ul className="flex flex-wrap items-baseline gap-3 font-mono text-meta uppercase text-ink-2">
              {meta.map((pair, i) => (
                <Fragment key={pair.key}>
                  {i > 0 && (
                    <li aria-hidden="true" className="text-hairline">
                      /
                    </li>
                  )}
                  <li className="flex items-baseline gap-2">
                    <span>{pair.key}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-ink">{pair.value}</span>
                  </li>
                </Fragment>
              ))}
            </ul>
          )}
        </header>
      </div>
      <div className="pt-10">{children}</div>
    </section>
  );
}
