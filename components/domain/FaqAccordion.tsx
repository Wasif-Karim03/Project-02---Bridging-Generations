type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: readonly FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-0 divide-y divide-hairline border-y border-hairline">
      {items.map((item) => (
        <li key={item.question}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-heading-5 text-ink transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent">
              <span className="text-balance">{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-heading-4 leading-none text-accent transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-[70ch] pb-6 text-body text-ink-2">{item.answer}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
