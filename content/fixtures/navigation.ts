export type NavItem = {
  href: string;
  label: string;
};

export const primaryNav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/students", label: "Students" },
  { href: "/donors", label: "Donors" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
];

export const donateCta = {
  href: "/donate",
  label: "Donate",
};

// Mobile drawer groups. Desktop nav stays narrower (primaryNav above) — the
// drawer surfaces every reachable destination so phone visitors don't need to
// type URLs. Editorial grouping: Explore (the work), Recognize (the people),
// Trust (legal + contact). Donate is rendered as a prominent CTA above the
// groups, not in any group.
export type NavGroup = {
  eyebrow: string;
  items: NavItem[];
};

export const mobileNavGroups: NavGroup[] = [
  {
    eyebrow: "Explore",
    items: [
      { href: "/about", label: "About" },
      { href: "/activities", label: "Activities" },
      { href: "/projects", label: "Projects" },
      { href: "/students", label: "Students" },
      { href: "/success-stories", label: "Success Stories" },
      { href: "/blog", label: "Blog" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    eyebrow: "Recognize",
    items: [
      { href: "/donors", label: "Donors" },
      { href: "/testimonials", label: "Testimonials" },
    ],
  },
  {
    eyebrow: "Trust",
    items: [
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
