import { Feature } from "@/components/ui/editorial";

type SecondaryOption = {
  label: string;
  amount: string;
  body: string;
  href: string;
};

type GivingOptionsStripProps = {
  monthlySuggestion: number;
};

export function GivingOptionsStrip({ monthlySuggestion }: GivingOptionsStripProps) {
  const secondaries: SecondaryOption[] = [
    {
      label: "Give once",
      amount: "Any amount",
      body: "Use the form above and choose Give once at checkout — every dollar still routes to program costs.",
      href: "#donate-hero-title",
    },
    {
      label: "Designate a project",
      amount: "Project-tied",
      body: "Back the meal program, the girls' scholarship fund, or a school-supply delivery.",
      href: "/projects",
    },
    {
      label: "Honor or memorial gift",
      amount: "Card included",
      body: "Mark a birthday, a teacher, or a family member. Write us and we'll send a card to whomever you name.",
      href: "/contact",
    },
  ];
  return (
    <section
      aria-labelledby="giving-options-title"
      className="bg-ground-3 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 lg:gap-16">
        <h2 id="giving-options-title" className="max-w-[20ch] text-balance text-heading-1 text-ink">
          Other ways to give
        </h2>
        <Feature breakout={false}>
          <Feature.Body>
            <Feature.Eyebrow>Sponsor monthly</Feature.Eyebrow>
            <Feature.Headline as="h3" href="#donate-hero-title">
              ${monthlySuggestion}/mo keeps one student in the classroom
            </Feature.Headline>
            <Feature.Lede>
              Tuition, books, daily meals, and materials for the full school year. The single most
              leveraged way to give — recurring sponsors are how the program plans staffing.
            </Feature.Lede>
          </Feature.Body>
        </Feature>
        <ul className="flex flex-col border-t border-hairline">
          {secondaries.map((option) => (
            <li key={option.label} className="border-b border-hairline">
              <a
                href={option.href}
                className="group block py-6 transition focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent lg:py-8"
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] lg:items-baseline lg:gap-10">
                  <span className="text-meta uppercase tracking-[0.1em] text-ink-2">
                    {option.amount}
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="text-balance text-heading-3 text-ink transition-colors group-hover:text-accent">
                      {option.label}
                    </span>
                    <span className="max-w-[60ch] text-body text-ink-2">{option.body}</span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
